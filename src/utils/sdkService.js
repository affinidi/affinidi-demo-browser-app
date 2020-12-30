import { AffinityWallet as Wallet } from '@affinidi/wallet-browser-sdk'
import { __dangerous } from '@affinidi/wallet-core-sdk'
import { Affinidi } from '@affinidi/common'
import JwtService from "@affinidi/common/dist/services/JwtService";
import { randomBytes } from "@affinidi/common/dist/shared/randomBytes";
import SdkError from "@affinidi/wallet-core-sdk/dist/shared/SdkError";
import config from "../config";
import cloudWalletApi from './apiService'

const { WalletStorageService } = __dangerous

const SDK_AUTHENTICATION_LOCAL_STORAGE_KEY = 'affinidi:accessToken'
const SDK_OPTIONS = {
  env: config.env,
  apiKey: config.accessApiKey
}

const keyStoneTestEncryptionKey = process.env.REACT_APP_KEYSTONE_TEST_ENCRYPTION_KEY
const keyStoneTestEncryptedSeed = process.env.REACT_APP_KEYSTONE_TEST_ENCRYPTED_SEED

class SDKConfigurator {
  static getSdkOptions() {
    const { env, apiKey } = SDK_OPTIONS
    const options = Wallet.setEnvironmentVarialbles({ env })

    console.log('sdkService # getSdkOptions')
    console.log(options)

    return Object.assign({}, options, { apiKey, env })
  }
}

class SdkService {
  constructor() {
    this.sdk = Wallet
    this.jwtService = new JwtService()
  }

  async init() {
    console.log('sdkService # init')
    const accessToken = localStorage.getItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY)
    if (!accessToken) {
      throw new SdkError('COR-9')
    }

    const { env, apiKey } = SDK_OPTIONS
    console.log('env: ', env)
    const { keyStorageUrl } = SDKConfigurator.getSdkOptions(env, apiKey)

    console.log('keyStorageUrl: ', keyStorageUrl)
    // console.log('accessToken: ', accessToken)

    const encryptedSeed = await WalletStorageService.pullEncryptedSeed(accessToken, keyStorageUrl, SDK_OPTIONS)

    console.log('encryptedSeed: ', encryptedSeed)

    const encryptionKey = await WalletStorageService.pullEncryptionKey(accessToken)

    console.log('encryptionKey: ', encryptionKey)

    return new this.sdk(encryptionKey, encryptedSeed, { ...SDK_OPTIONS, cognitoUserTokens: { accessToken }})
  }

  async initTestKeyStoneIssuer() {
    if (keyStoneTestEncryptionKey && keyStoneTestEncryptedSeed) {
      return new this.sdk(keyStoneTestEncryptionKey, keyStoneTestEncryptedSeed, SDK_OPTIONS)
    }

    return this.init()
  }

  async signOut() {
    const networkMember = await this.init()
    await networkMember.signOut()
    localStorage.removeItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY)
  }

  async signUp(username, password, messageParameters) {
    const signUpParams = { username, password }

    const { data: token } =  await cloudWalletApi.post('/users/signup', signUpParams)

    console.log('token', token)
    return token
  }

  async confirmSignUp(token, confirmationCode, options = {}) {
    const signUpConfirmParams = { token, confirmationCode }

    const response =  await cloudWalletApi.post('/users/signup/confirm', signUpConfirmParams)

    console.log('confirmSignup response')
    console.log(response.body)
    console.log(response.data)
    const { accessToken, did } = response.data

    console.log('accessToken: ', accessToken)
    SdkService._saveLoginCredentialsToLocalStorage(accessToken, did)
  }

  async resendSignUpConfirmationCode(username, messageParameters) {
    // ISSUE: CommonNetworkMember.resendSignUpConfirmationCode does not call CommonNetworkMember.setEnvironmentVarialbles(options)
    // So the below call will always return 'User not found'
    await this.sdk.resendSignUpConfirmationCode(username, SDK_OPTIONS, messageParameters)
  }

  async getDidAndCredentials() {
    console.log('sdkService # getDidAndCredentials')
    const networkMember = await this.init()

    const did = localStorage.getItem('did')
    console.log(did)

    let credentials = []
    try {
      console.log('before networkMember.getCredentials()')
      credentials = await networkMember.getCredentials()
      console.log(credentials)
    } catch (error) {
      console.log('no credentials', error)
    }

    return { did, credentials }
  }

  async validateCredential(credential) {
    //TODO: pass correct registryURL to constructor
    const affinidi = new Affinidi({ apiKey: SDK_OPTIONS.apiKey })
    const result = await affinidi.validateCredential(credential)

    return result
  }

  async fromLoginAndPassword(username, password) {
    const networkMember = await this.sdk.fromLoginAndPassword(username, password, SDK_OPTIONS)
    SdkService._saveAccessTokenToLocalStorage(networkMember)
    return networkMember
  }

  async changeUsername(username) {
    const networkMember = await this.init()
    await networkMember.changeUsername(username, SDK_OPTIONS)
  }

  async confirmChangeUsername(username, confirmationCode) {
    const networkMember = await this.init()
    await networkMember.confirmChangeUsername(username, confirmationCode, SDK_OPTIONS)
  }

  async passwordlessLogin(username, messageParameters) {
    // const token = await this.sdk.passwordlessLogin(username, SDK_OPTIONS, messageParameters)

    console.log('sdkService # passwordlessLogin')
    const loginParams = { username }

    const { data: token } =  await cloudWalletApi.post('/users/sign-in-passwordless', loginParams)

    console.log('token: ', token)
    return token
  }

  async completeLoginChallenge(token, confirmationCode) {
    console.log('sdkService # completeLoginChallenge')


    const loginConfirmParams = { token, confirmationCode }

    const response = await cloudWalletApi.post('/users/sign-in-passwordless/confirm', loginConfirmParams)
    console.log(response)

    const { accessToken, did } = response.data
    SdkService._saveLoginCredentialsToLocalStorage(accessToken, did)

    // const networkMember = await this.sdk.completeLoginChallenge(token, confirmationCode, SDK_OPTIONS)
    // SdkService._saveAccessTokenToLocalStorage(networkMember)
    // return networkMember
  }

  async forgotPassword(username, messageParameters) {
    await this.sdk.forgotPassword(username, SDK_OPTIONS, messageParameters)
  }

  async forgotPasswordSubmit(username, confirmationCode, password) {
    await this.sdk.forgotPasswordSubmit(username, confirmationCode, password, SDK_OPTIONS)
  }

  async register(password) {
    return this.sdk.register(password, SDK_OPTIONS)
  }

  async signUpWithExistsEntity(keyParams, username, password, messageParameters) {
    const networkMember = await this.sdk.signUpWithExistsEntity(keyParams, username, password, SDK_OPTIONS, messageParameters)
    SdkService._saveAccessTokenToLocalStorage(networkMember)
    return networkMember
  }

  async changePassword(oldPassword, newPassword) {
    const networkMember = await this.init()
    return networkMember.changePassword(oldPassword, newPassword, SDK_OPTIONS)
  }

  async createCredentialShareRequestTokenFromRequesterDid(credentialRequirements, requesterDid) {
    const jti = await randomBytes(8).toString('hex');

    const jwtObject = {
      header: {
        typ: 'JWT',
        alg: 'ES256K',
      },
      payload: {
        exp: Date.now() + (60 * 10 * 1000),
        typ: 'credentialRequest',
        iss: requesterDid.includes('#') ? requesterDid : requesterDid + '#primary',
        aud: '',
        interactionToken: { credentialRequirements, callbackURL: "" },
        jti,
      },
      signature: 'invalid',
    }

    return this.jwtService.encodeObjectToJWT(jwtObject)
  }

  async getCredentials(credentialShareRequestToken, fetchBackupCredentials) {
    const networkMember = await this.init()
    return networkMember.getCredentials(credentialShareRequestToken, fetchBackupCredentials)
  }

  async saveCredentials(credentials) {
    const networkMember = await this.init()
    return networkMember.saveCredentials(credentials)
  }

  async createCredentialShareResponseToken(credentialShareRequestToken, suppliedCredentials) {
    const networkMember = await this.init()
    return networkMember.createCredentialShareResponseToken(credentialShareRequestToken, suppliedCredentials)
  }

  async createPresentationFromChallenge(credentialShareRequestToken, suppliedCredentials, domain) {
    const networkMember = await this.init()
    return networkMember.createPresentationFromChallenge(credentialShareRequestToken, suppliedCredentials, domain)
  }

  async createCredentialOfferResponseToken(credentialOfferToken) {
    const networkMember = await this.init()
    return networkMember.createCredentialOfferResponseToken(credentialOfferToken)
  }

  parseToken(token) {
    return JwtService.fromJWT(token)
  }

  // TODO: when all the sdk methods are converted to API calls, remove one of these methods
  static _saveAccessTokenToLocalStorage(networkMember) {
    try {
      localStorage.setItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY, networkMember.accessToken)
    } catch (err) {
      console.error(err)
    }
  }
  static _saveLoginCredentialsToLocalStorage(accessToken, did) {
    try {
      localStorage.setItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY, accessToken)
      localStorage.setItem('did', did)

    } catch (err) {
      console.error(err)
    }
  }
}

export default SdkService

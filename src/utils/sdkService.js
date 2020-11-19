import decodeEnv from './decodeEnv'
import { AffinityWallet as Wallet } from '@affinidi/wallet-browser-sdk'
import { Affinidi } from '@affinidi/common'
import JwtService from "@affinidi/common/dist/services/JwtService";
import { randomBytes } from "@affinidi/common/dist/shared/randomBytes";

class SdkService {
  constructor() {
    const apiKey = process.env.REACT_APP_API_KEY

    this.options = {
      env: decodeEnv(process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV),
      apiKey
    }
    this.sdk = Wallet
    this.jwtService = new JwtService()
  }

  async init() {
    const networkMember = await this.sdk.init(this.options)
    return networkMember
  }

  async signOut() {
    const networkMember = await this.init()
    await networkMember.signOut()
  }

  async signUp(username, password, messageParameters) {
    const token = await this.sdk.signUp(username, password, this.options, messageParameters)
    return token
  }

  async confirmSignUp(token, confirmationCode, options = {}) {
    await this.sdk.confirmSignUp(
      token,
      confirmationCode,
      { ...options, ...this.options}
    )
  }

  async resendSignUpConfirmationCode(username, messageParameters) {
    // ISSUE: CommonNetworkMember.resendSignUpConfirmationCode does not call CommonNetworkMember.setEnvironmentVarialbles(options)
    // So the below call will always return 'User not found'
    await this.sdk.resendSignUpConfirmationCode(username, this.options, messageParameters)
  }

  async getDidAndCredentials() {
    const networkMember = await this.init()

    const did = networkMember.did

    let credentials = []
    try {
      credentials = await networkMember.getCredentials()
    } catch (error) {
      console.log('no credentials', error)
    }

    return { did, credentials }
  }

  async validateCredential(credential) {
    //TODO: pass correct registryURL to constructor
    const affinidi = new Affinidi({ apiKey: this.options.apiKey })
    const result = await affinidi.validateCredential(credential)

    return result
  }

  async fromLoginAndPassword(username, password) {
    const networkMember = await this.sdk.fromLoginAndPassword(username, password, this.options)
    return networkMember
  }

  async changeUsername(username) {
    const networkMember = await this.init()
    await networkMember.changeUsername(username, this.options)
  }

  async confirmChangeUsername(username, confirmationCode) {
    const networkMember = await this.init()
    await networkMember.confirmChangeUsername(username, confirmationCode, this.options)
  }

  async passwordlessLogin(username, messageParameters) {
    const token = await this.sdk.passwordlessLogin(username, this.options, messageParameters)
    return token
  }

  async completeLoginChallenge(token, confirmationCode) {
    await this.sdk.completeLoginChallenge(token, confirmationCode, this.options)
  }

  async forgotPassword(username, messageParameters) {
    await this.sdk.forgotPassword(username, this.options, messageParameters)
  }

  async forgotPasswordSubmit(username, confirmationCode, password) {
    await this.sdk.forgotPasswordSubmit(username, confirmationCode, password, this.options)
  }

  async register(password) {
    return this.sdk.register(password, this.options)
  }

  async signUpWithExistsEntity(keyParams, username, password, messageParameters) {
    return this.sdk.signUpWithExistsEntity(keyParams, username, password, this.options, messageParameters)
  }

  async changePassword(oldPassword, newPassword) {
    const networkMember = await this.init()
    return networkMember.changePassword(oldPassword, newPassword, this.options)
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

  async createCredentialShareResponseToken(credentialShareRequestToken, suppliedCredentials) {
    const networkMember = await this.init()
    return networkMember.createCredentialShareResponseToken(credentialShareRequestToken, suppliedCredentials)
  }
}

export default SdkService

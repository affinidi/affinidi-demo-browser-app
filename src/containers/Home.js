import React, {Component, Fragment} from 'react'
import { getVCNamePersonV1Context, getVCEmailPersonV1Context, getVCPhonePersonV1Context } from '@affinidi/vc-data'
import {Button} from 'react-bootstrap'
import './Home.css'
import { CreateVerifiablePresentationModal } from "./CreateVerifiablePresentationModal";
import { CredentialShareModal } from "./CredentialShareModal";
import { DeleteCredentialModal } from "./DeleteCredentialModal";
import queryString from 'query-string'

const loadingGif = require('../static/images/loading.gif')

const nameClaimMetadata = {
  context: ['https://www.w3.org/2018/credentials/v1', getVCNamePersonV1Context()],
  name: 'Name',
  type: ['VerifiableCredential', 'NameCredentialPersonV1']
}

const emailClaimMetadata = {
  context: ['https://www.w3.org/2018/credentials/v1', getVCEmailPersonV1Context()],
  name: 'Email address',
  type: ['VerifiableCredential', 'EmailCredentialPersonV1'],
}

const phoneNumberClaimMetadata = {
  context: ['https://www.w3.org/2018/credentials/v1', getVCPhonePersonV1Context()],
  name: 'Mobile Phone Number',
  type: ['VerifiableCredential', 'PhoneCredentialPersonV1'],
}

class ValidatableCredential {
  constructor(credential, status = undefined, errorMessage = '') {
    this.credential = credential
    this.status = status
    this.errorMessage = errorMessage
  }
}

class Home extends Component {
  constructor(props) {
    super(props)

    const { processToken } = queryString.parse(this.props.location.search)

    this.state = {
      isLoading: false,
      isDeleteModalShown: false,
      areCredentialDetailsShown: false,
      credentials: [],
      did: null,
      verifiableCredentials: [],
      verifiablePresentationModalCredential: undefined,
      credentialShareRequestToken: processToken || undefined,
      credentialShareRequestModalToken: processToken || undefined,
    }
  }

  getRandomInt() {
    const min = 1
    const max = 100000

    return Math.floor(Math.random() * (max - min)) + min
  }

  renderCredentials(verifiableCredentials) {
    const credentialsList = []

    for (const [key, verifiableCredential] of verifiableCredentials.entries()) {
      const { credential } = verifiableCredential

      const value = JSON.stringify(credential, undefined, '\t')

      credentialsList.push(
        <div key={key}>
          <div className='ValidateArea'>
            <div>
              <Button type='button' bsSize='lg' disabled={this.state.isLoading} onClick={ event => this.validateCredential(event, verifiableCredential) }>
                Validate
              </Button>
            </div>
            { this.state.isLoading &&
              <img className='LoadingGif' src={loadingGif} alt="loading gif"/>
            }
            { verifiableCredential.status &&
              <svg className='Icon' width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="20" fill="#00ABA0"/>
                <path d="M26.1155 16L17.1145 25.01L13 20.8955" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            { verifiableCredential.status === false &&
              <div className='ValidateError'>
                <svg className='Icon' width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="15" fill="#F4804F"/>
                  <path d="M13.3772 15.1942C13.3772 14.275 14.083 13.523 14.9457 13.523C15.8084 13.523 16.5142 14.275 16.5142 15.1997L16.5142 20.529C16.5142 21.4482 15.8084 22.2002 14.9457 22.2002C14.1615 22.2002 13.5079 21.5818 13.3929 20.7852C13.3824 20.7017 13.3772 20.6126 13.3772 20.529L13.3772 15.1942Z" fill="#F5F6FA"/>
                  <path d="M17.1416 9.69609C17.1416 10.9112 16.1608 11.892 14.9457 11.892C13.7258 11.892 12.745 10.9112 12.7498 9.69609C12.7498 8.48103 13.7307 7.50019 14.9457 7.50019C16.1608 7.50019 17.1416 8.48103 17.1416 9.69609Z" fill="#F5F6FA"/>
                </svg>
                <p className='ErrorMessage'>{ verifiableCredential.errorMessage }</p>
              </div>
            }
          </div>
          <div className='TextareaContainer'>
            <textarea key={this.getRandomInt()} readOnly name='credentials' rows='23' value={value}/>
            { this.state.areCredentialDetailsShown &&
              <Button className='HideDetailsButton' onClick={ () => this.setState({ areCredentialDetailsShown: false }) }>
                Hide Details
              </Button>
            }
            <Button className='ShareButton' onClick={event => this.openVerifiablePresentationModal(event, credential)}>
              Share
            </Button>
            { !this.state.areCredentialDetailsShown &&
              <p className='ShowDetails' onClick={ () => this.setState({ areCredentialDetailsShown: true }) }>
                Show Details
              </p>
            }
            { this.state.areCredentialDetailsShown &&
              <p className='DeleteCredential' onClick={ event => this.openDeleteModal(event) }>
                Delete credential
              </p>
            }
          </div>
          <DeleteCredentialModal
            isShown={this.state.isDeleteModalShown}
            loading={this.state.isLoading}
            onDelete={() => this.deleteCredential(credential.id)}
            onClose={() => this.closeDeleteModal()}
          />
        </div>
      )
    }

    return (credentialsList)
  }

  async validateCredential(event, verifiableCredential) {
    event.preventDefault()

    let isLoading = true
    this.setState({ isLoading })

    try {
      const status = await window.sdk.validateCredential(verifiableCredential.credential)

      if (!status.result) {
        verifiableCredential.errorMessage = status.error
      }

      verifiableCredential.status = status.result

      this.forceUpdate()
    } catch (error) {
      console.log(error.message)
    }

    isLoading = false
    this.setState({ isLoading })
  }

  async deleteCredential(credentialId) {
    await this.setState({ isLoading: true })

    const networkMember = await window.sdk.init()
    try {
      await networkMember.deleteCredential(credentialId)
      await this.refreshCredentials(networkMember)

      await this.setState({ isLoading: false, isDeleteModalShown: false, areCredentialDetailsShown: false })
    } catch (error) {
      console.log(error)
      alert(error.message)

      await this.setState({ isLoading: false, isDeleteModalShown: false })
    }
  }

  async openDeleteModal(event) {
    event.preventDefault()

    await this.setState({ isDeleteModalShown: true })
  }

  closeDeleteModal() {
    this.setState({ isDeleteModalShown: false })
  }

  openVerifiablePresentationModal(event, credential) {
    event.preventDefault()

    this.setState({ verifiablePresentationModalCredential: credential })
  }

  closeVerifiablePresentationModal() {
    this.setState({ verifiablePresentationModalCredential: undefined })
  }

  openCredentialShareModal(event) {
    event.preventDefault()

    const { credentialShareRequestToken } = this.state

    if (!credentialShareRequestToken || credentialShareRequestToken.trim().length < 1) {
      return alert('Please enter a credential share request token.')
    }

    this.setState({ credentialShareRequestModalToken: credentialShareRequestToken })
  }

  closeCredentialShareModal() {
    this.setState({ credentialShareRequestModalToken: undefined })
  }

  // Depending on whether the username is a phone number, email, or neither,
  // returns the appropriate combination of claim and credentialMetadata
  makeClaimAndCredentialMetadata(username) {
    const isPhoneNumber = username.startsWith('+')
    if (isPhoneNumber) {
      return {
        credentialMetadata: phoneNumberClaimMetadata,
        claim: {
          data: {
            '@type': ['Person', 'PersonE', 'EmailPerson'],
            email: username,
            name: username,
          }
        }
      }
    }

    const isUsername = username.indexOf('+') === -1 && username.indexOf('@') === -1
    if (isUsername) {
      return {
        credentialMetadata: nameClaimMetadata,
        claim: {
          data: {
            '@type': ['Person', 'PersonE', 'NamePerson'],
            givenName: username,
            familyName: username
          }
        }
      }
    }

    return {
      credentialMetadata: emailClaimMetadata,
      claim: {
        data: {
          '@type': ['Person', 'PersonE', 'EmailPerson'],
          email: username,
          name: username,
        }
      }
    }
  }

  makeVerifiableCredentials(credentials) {
    return credentials.map(credential => new ValidatableCredential(credential))
  }

  async getCredentials(networkMember) {
    const credentials = await networkMember.getCredentials()
    const verifiableCredentials = this.makeVerifiableCredentials(credentials)
    return { credentials, verifiableCredentials }
  }

  async refreshCredentials(networkMember) {
    const { credentials, verifiableCredentials } = await this.getCredentials(networkMember)
    this.setState({ credentials, verifiableCredentials })
  }

  async createLoginMethodCredential(event) {
    event.preventDefault()

    const username = this.props.location.state.username
    const { credentialMetadata, claim } = this.makeClaimAndCredentialMetadata(username)
    const networkMember = await window.sdk.init()

    if (networkMember) {
      const requesterDid = this.state.did

      let credential
      try {
        credential = await networkMember.signCredential(claim, credentialMetadata, { requesterDid })

        await networkMember.saveCredentials([ credential ])
        await this.refreshCredentials(networkMember)
      } catch (error) {
        console.log(JSON.stringify(error))
        // throw error
      }
    }
  }

  async componentDidMount() {
    try {
      const { did, credentials } = await window.sdk.getDidAndCredentials();
      this.props.userHasAuthenticated(true)
      const verifiableCredentials = this.makeVerifiableCredentials(credentials)

      this.setState({ did, credentials, verifiableCredentials })
    } catch (error) {
      this.props.userHasAuthenticated(false)
      this.props.history.push('/login')
    }
  }

  render() {
    const { did, verifiableCredentials, verifiablePresentationModalCredential, credentialShareRequestModalToken } = this.state

    const haveCredentials = verifiableCredentials && verifiableCredentials.length > 0
    const { isAuthenticated } = this.props

    return (
      <Fragment>
        <div className='Home'>
          <form className='Form container'>
            <h1 className='Title'>Wallet</h1>
            { isAuthenticated && did &&
              <div>
                <Button bsSize='large' disabled={ haveCredentials } onClick={ event => this.createLoginMethodCredential(event) }>
                  Create Keystone VC
                </Button>
              </div>
            }

            { isAuthenticated && did &&
              <label>
                DID:
                <input readOnly type='text' name='did' value={ did.split(';elem:')[0] } />
              </label>
            }

            { isAuthenticated && did &&
              <label>
                Credential Share Request Token:
                <div className='ShareToken'>
                  <input
                      type='text'
                      autoComplete="off"
                      name='credentialShareRequestToken'
                      value={this.state.credentialShareRequestToken}
                      onChange={(e) => this.setState({ credentialShareRequestToken: e.target.value })}/>
                  <Button bsSize='large' onClick={(event) => this.openCredentialShareModal(event)}>Share</Button>
                </div>
              </label>
            }

            <br />

            { isAuthenticated && haveCredentials &&
              <div className='Credentials'>
                <p className='Title'>Credentials:</p>
                { this.renderCredentials(verifiableCredentials) }
              </div>
            }

          </form>
        </div>
        {verifiablePresentationModalCredential && (
            <CreateVerifiablePresentationModal
                credential={verifiablePresentationModalCredential}
                onClose={() => this.closeVerifiablePresentationModal()} />
        )}
        {credentialShareRequestModalToken && (
            <CredentialShareModal
                credentialShareRequestToken={credentialShareRequestModalToken}
                onClose={() => this.closeCredentialShareModal()} />
        )}
      </Fragment>
    )
  }
}

export default Home

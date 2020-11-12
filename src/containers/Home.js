import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import './Home.css'
import { getVCNamePersonV1Context, getVCEmailPersonV1Context, getVCPhonePersonV1Context } from '@affinidi/vc-data'

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

    this.state = {
      isLoading: false,
      credentials: [],
      did: null,
      verifiableCredentials: []
    }
  }

  getRandomInt() {
    const min = 1
    const max = 100000

    return Math.floor(Math.random() * (max - min)) + min
  }

  renderCredentials(verifiableCredentials) {
    const credentialsList = []

    for (const verifiableCredential of verifiableCredentials) {
      const { credential } = verifiableCredential
      delete credential['@context']

      const value = JSON.stringify(credential, undefined, '\t')

      credentialsList.push(
        <div>
          <div className='ValidateArea'>
            <Button type='button' bsSize='lg' disabled={this.state.isLoading} onClick={ event => this.validateCredential(event, credential.id) }>
              Validate
            </Button>
            { this.state.isLoading &&
              <img className='LoadingGif' src={loadingGif} alt="loading gif"/>
            }
            { verifiableCredential.status &&
              <svg className='Icon' width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="20" fill="#00ABA0"/>
                <path d="M26.1155 16L17.1145 25.01L13 20.8955" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
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
          <textarea key={this.getRandomInt()} readOnly name='credentials' rows='23' value={value} />
          <Button bsSize='large' onClick={ event => this.deleteCredential(event, credential.id) }>
            Delete VC
          </Button>
        </div>
      )
    }

    return (credentialsList)
  }

  async validateCredential(event, credentialID) {
    event.preventDefault()

    let isLoading = true
    this.setState({ isLoading })

    const networkMember = await window.sdk.init()
    const { verifiableCredentials } = await this.getCredentials(networkMember)

    const verifiableCredential = verifiableCredentials.find((verifiableCredential) => {
      return verifiableCredential.credential.id === credentialID
    })

    try {
      const status = await window.sdk.validateCredential(verifiableCredential.credential)

      verifiableCredentials.forEach((vc) => {
        if (vc.credential.id === verifiableCredential.credential.id) {
          if (!status.result) {
            vc.errorMessage = status.error
          }

          vc.status = status.result
        }
      })

      this.setState({ verifiableCredentials })
    } catch (error) {
      console.log(error.message)
    }

    isLoading = false
    this.setState({ isLoading })
  }

  async deleteCredential(event, credentialId) {
    event.preventDefault()

    const networkMember = await window.sdk.init()
    try {
      await networkMember.deleteCredential(credentialId)
      await this.refreshCredentials(networkMember)
    } catch (error) {
      console.log(error)
      alert(error.message)
    }
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
    const { did, verifiableCredentials } = this.state

    const haveCredentials = verifiableCredentials && verifiableCredentials.length > 0
    const { isAuthenticated } = this.props

    return (
      <Fragment>
        <div className='Home'>
          <form className='Form'>
            { isAuthenticated &&
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

            <br />

            { isAuthenticated && haveCredentials &&
              <div className='Credentials'>
                <p className='Title'>Credentials:</p>
                { this.renderCredentials(verifiableCredentials) }
              </div>
            }

          </form>
        </div>
      </Fragment>
    )
  }
}

export default Home

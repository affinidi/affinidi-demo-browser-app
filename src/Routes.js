import React                  from 'react'
import { Switch }             from 'react-router-dom'
import AppliedRoute           from './components/AppliedRoute'
import Home                   from './containers/Home'
import Login                  from './containers/Login'
import PasswordlessLogin      from './containers/PasswordlessLogin'
import CompleteLoginChallenge from './containers/CompleteLoginChallenge'
import Signup                 from './containers/Signup'
import ConfirmSignup          from './containers/ConfirmSignup'
import NotFound               from './containers/NotFound'
import ResetPassword          from './containers/ResetPassword'
import ConfirmResetPassword   from './containers/ConfirmResetPassword'
import ChangeUsername         from './containers/ChangeUsername'
import ConfirmChangeUsername  from './containers/ConfirmChangeUsername'
import SignupWithDid          from './containers/SignupWithDid'
import ChangePassword         from './containers/ChangePassword'

export default function Routes({ appProps }) {
  return (
    <Switch>
      <AppliedRoute path='/' exact component={Home} appProps={appProps} />
      <AppliedRoute path='/login' exact component={Login} appProps={appProps} />
      <AppliedRoute path='/passwordless-login' exact component={PasswordlessLogin} appProps={appProps} />
      <AppliedRoute path='/reset-password' exact component={ResetPassword} appProps={appProps} />
      <AppliedRoute path='/confirm-reset-password' exact component={ConfirmResetPassword} appProps={appProps} />
      <AppliedRoute path='/complete-login' exact component={CompleteLoginChallenge} appProps={appProps} />
      <AppliedRoute path='/signup' exact component={Signup} appProps={appProps} />
      <AppliedRoute path='/confirm-signup' exact component={ConfirmSignup} appProps={appProps} />
      <AppliedRoute path='/change-username' exact component={ChangeUsername} appProps={appProps} />
      <AppliedRoute path='/confirm-change-username' exact component={ConfirmChangeUsername} appProps={appProps} />
      <AppliedRoute path='/signup-with-did' exact component={SignupWithDid} appProps={appProps} />
      <AppliedRoute path='/change-password' exact component={ChangePassword} appProps={appProps} />
      <AppliedRoute component={NotFound} />
    </Switch>
  )
}

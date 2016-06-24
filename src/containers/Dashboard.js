import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Navbar from '../components/Navbar'
import Content from '../components/Content'
import Footer from '../components/Footer'
import styles from '../main.styl'

import * as actions from '../actions'

export default class Dashboard extends React.Component {
  constructor(props, context) {
   super(props, context)
  }
  isAuthenticated() {
    
    let isRefresh = !this.props.auth.expiresAt
    let arr = JSON.parse(localStorage.getItem('auth.data'))
    let isValid = Array.isArray(arr)
    
    // if refresh and there's no auth.data key 
    // or if it does exist but its empty, set and redirect
    if (isRefresh && !isValid || isRefresh && !arr.length) {
      this.setAndRedirect()
    }


    // if refresh, and arr.length, iterate over the keys, 
    // if there is a match to the token in the url params
    // check if its been expired
    // if expired, remove this key from storage and redirect
    // if not expired, re-set user obj on this.props
    // if no token was found, redirect
    if (isRefresh) {
      let token = this.props.params.token
      var isBadToken = true
      arr.forEach((obj, i) => {
        var isMatch = token === obj.user.token
        if (isMatch) {
          isBadToken = false
          var isExpired = Date.now() >= obj.expiresAt
          if (isExpired) {
            localStorage.remoteItem('auth.data')
            window.location.href = 'http://localhost:3000'
          } else {
            this.props.auth.user = obj.user
          }
        }
      })      
    
    if (isBadToken) {
      this.setAndRedirect()
      }    
    } else {
      // if initial login or signup (not refresh)
      // set the token and expiredAt props
      let obj = {}
      let arr = []      
      obj.user = this.props.auth.user
      obj.expiresAt = this.props.auth.expiresAt
      arr.push(obj)
      localStorage.setItem('auth.data', JSON.stringify(arr))
    }
  }
  setAndRedirect() {
    localStorage.setItem('auth.data', JSON.stringify([]))
  }
  render() {
    const { actions, auth } = this.props
    this.isAuthenticated()
    return (
      <div className={styles.wrap}>
        <Navbar actions={actions} auth={auth} />
        <Content actions={actions} auth={auth} />
        <Footer actions={actions} auth={auth} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
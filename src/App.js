import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';

import './App.css';

import HomePage from './pages/homepage/homepage.component';
import CheckoutPage from './pages/checkout/checkout.component';
import CollectionsOverview from './components/collections-overview/collections-overview.component';
import CollectionPage from './pages/collection/collection.component';
import SignInAndSignUpPage from './pages/sign-in-and-sign-up/sign-in-and-sign-up.component';
import Header from './components/header/header.component';
import { auth, createUserProfileDocument } from './firebase/firebase.utils';
import { setCurrentUser } from './redux/user/user.actions';

class App extends React.Component {

  unsubscribeFromAuth = null;

  componentDidMount() {
    const { setCurrentUser } = this.props;

    this.unsubscribeFromAuth = auth.onAuthStateChanged(async userAuth => {
      if (userAuth) {
        const userRef = await createUserProfileDocument(userAuth);

        userRef.onSnapshot(snapShot => {
          setCurrentUser({
            id: snapShot.id,
            ...snapShot.data()
          });
        });
      }

      setCurrentUser(userAuth);
    });
  }

  componentWillUnmount() {
    this.unsubscribeFromAuth();
  }

  render(){
    const { currentUser } = this.props;
    return (
      <div className="App">
          <Header/>
          <Routes>
          <Route exact path='/' element={<HomePage/>} />
          <Route path='shop'>
            <Route index element={<CollectionsOverview/>} />
            <Route path=':collectionId' element={<CollectionPage/>} />
          </Route>
          <Route exact path='/checkout' element={<CheckoutPage/>} />
            <Route
              exact path='/signin'
              element={
                currentUser !== null ? (
                  <Navigate replace to='/' />
                ) : (
                  <SignInAndSignUpPage />
                )
              }
            />
          </Routes>
      </div>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  currentUser: user.currentUser
});

const mapDispatchToProps = dispatch => ({
  setCurrentUser: user => dispatch(setCurrentUser(user))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
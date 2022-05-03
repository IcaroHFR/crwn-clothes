import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import './App.css';

import {
  firestore,
  convertCollectionsSnapshotToMap
} from './firebase/firebase.utils.js';

import { updateCollections } from './redux/shop/shop.actions';

import WithSpinner from './components/with-spinner/with-spinner.component';

import HomePage from './pages/homepage/homepage.component';
import CheckoutPage from './pages/checkout/checkout.component';
import CollectionsOverview from './components/collections-overview/collections-overview.component';
import CollectionPage from './pages/collection/collection.component';
import SignInAndSignUpPage from './pages/sign-in-and-sign-up/sign-in-and-sign-up.component';
import Header from './components/header/header.component';
import { auth, createUserProfileDocument } from './firebase/firebase.utils';
import { setCurrentUser } from './redux/user/user.actions';
import { selectCurrentUser } from './redux/user/user.selectors'

const CollectionsOverviewWithSpinner = WithSpinner(CollectionsOverview);
const CollectionPageWithSpinner = WithSpinner(CollectionPage);

class App extends React.Component {
  
  state = {
    loading: true
  };

  unsubscribeFromAuth = null;

  componentDidMount() {
    const { setCurrentUser } = this.props;
    const { updateCollections } = this.props;
    const collectionRef = firestore.collection('collections');

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

    collectionRef.get().then(snapshot => {
      const collectionsMap = convertCollectionsSnapshotToMap(snapshot);
      updateCollections(collectionsMap);
      this.setState({ loading: false });
    });
    
  }

  componentWillUnmount() {
    this.unsubscribeFromAuth();
  }

  render(){
    const { currentUser } = this.props;
    const { loading } = this.state;

    return (
      <div className="App">
          <Header/>
          <Routes>
          <Route exact path='/' element={<HomePage/>} />
          <Route path='shop'>
            <Route index element={<CollectionsOverviewWithSpinner isLoading={loading}/>} />
            <Route path=':collectionId' element={<CollectionPageWithSpinner isLoading={loading}/>} />
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

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser
});

const mapDispatchToProps = dispatch => ({
  updateCollections: collectionsMap => dispatch(updateCollections(collectionsMap)),
  setCurrentUser: user => dispatch(setCurrentUser(user))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
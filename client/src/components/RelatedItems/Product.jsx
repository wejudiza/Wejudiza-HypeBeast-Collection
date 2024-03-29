import React from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { Checkmark } from 'react-checkmark';
import RelatedStars from './RelatedStars.jsx'

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

export default class Product extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalView: false,
      id: '',
      name: '',
      category: '',
      features: [],
      ratings: {},
      thumbnail_url: '',
      original_price: '',
      sale_price: '',
      currentFeatures: [] /*JSON.parse(localStorage[`${this.props.currentProduct}_info`]).features*/,
      // STAR REVIEWS
      avgStars: 0,
    };
    this.getProductInfo = this.getProductInfo.bind(this);
    this.getStyles = this.getStyles.bind(this);
    this.handleModal = this.handleModal.bind(this);
    this.getReviews = this.getReviews.bind(this);
    this.salePriceMode = this.salePriceMode.bind(this);
    this.setSessionStorage = this.setSessionStorage.bind(this);
  }

  componentDidMount() {
    this.getProductInfo(this.props.productId);
    this.getStyles(this.props.productId);
    this.getReviews(this.props.productId);
  }

  componentDidUpdate(prevProps) {
    if(this.props.productId !== prevProps.productId) {
      this.getProductInfo(this.props.productId);
      this.getStyles(this.props.productId);
      this.getReviews(this.props.productId);
    }
  }

  handleModal() {
    const newFeatures = this.state.features.map((item) => (
      // *** Creates a copy of item object and checks if item property exists, if not create item property
      {...item, item: 0}
    ))
    const newCurrFeatures = this.state.currentFeatures.map((item) => (
      {...item, item: 1}
    ))

    this.setState({
      modalView: !this.state.modalView,
      features: newFeatures,
      currentFeatures: newCurrFeatures
    }, () => {
      this.setState({
        filteredFeatures: this.state.features.concat(this.state.currentFeatures).filter((feature, index, self) => {
          // *** Checking to see if feature and value are equal and if index are a match
          // findIndex returns very first index of what we're trying to find  - to see if these are duplicates
          let temp = self.findIndex((i) => (i.feature === feature.feature && i.value === feature.value && i.item !== feature.item && i.item !== 2))
          // console.log('temp', temp, index)
          // If has been found, then change feature.item to
          if (temp > -1) {
            feature.item = 2;
            return true;
          } else {
            // It is not a duplicate, now check if has feature and value we're looking for
            let temp2 = self.findIndex((i) => (i.feature === feature.feature && i.value === feature.value)) === index
            if (temp2) {
              return true;
            }
            return false;
          }
        })
        /*[...new Set(this.state.features.concat(this.state.currentFeatures).map(JSON.stringify))].map(JSON.parse)*/
      });
    });
  }

  // axios get request to /products/productId
  getProductInfo(productId) {
    let dataName = `${productId}_info`;
    if (!localStorage[dataName]) {
      axios.get(`api/products/${productId}`)
      .then((results) => {
        localStorage.setItem(dataName, JSON.stringify(results.data));
        this.setState({
          id: results.data.id,
          name: results.data.name,
          slogan: results.data.slogan,
          description: results.data.description,
          category: results.data.category,
          default_price: results.data.default_price,
          features: results.data.features,
          currentFeatures: JSON.parse(localStorage[`${this.props.currentProduct}_info`]).features,
        });
      })
      .catch((err) => console.log('getProductInfo err: ', err));
    } else {
      this.setState({
        id: JSON.parse(localStorage[dataName]).id,
        name: JSON.parse(localStorage[dataName]).name,
        slogan: JSON.parse(localStorage[dataName]).slogan,
        description: JSON.parse(localStorage[dataName]).description,
        category: JSON.parse(localStorage[dataName]).category,
        default_price: JSON.parse(localStorage[dataName]).default_price,
        features: JSON.parse(localStorage[dataName]).features,
        currentFeatures: JSON.parse(localStorage[`${this.props.currentProduct}_info`]).features,
      });
    }
  }

  getStyles(productId) {
    let dataName = `${productId}_styles`;
    if (!localStorage[dataName]) {
      axios.get(`api/products/${productId}/styles`)
        .then((results) => {
          // console.log('style results', results.data);
          // console.log('results.data.results', results.data.results)
          localStorage.setItem(dataName, JSON.stringify(results.data.results))
          this.setState({
            thumbnail_url: results.data.results[0].photos[0].thumbnail_url,
            original_price: results.data.results[0].original_price,
            sale_price: results.data.results[0].sale_price,
          });
        })
        .catch((err) => console.log('getStyles err: ', err));
    } else {
      // console.log('localStorage', JSON.parse(localStorage[dataName])[0].photos[0].thumbnail_url)
      this.setState({
        thumbnail_url: JSON.parse(localStorage[dataName])[0].photos[0].thumbnail_url || '',
        original_price: JSON.parse(localStorage[dataName])[0].original_price,
        sale_price: JSON.parse(localStorage[dataName])[0].sale_price,
      });
    }
  }

  getReviews(productId) {
    axios.get('api/reviews', {
      params: {
        product_id: productId,
      }
    })
      .then((rawData) => {
        // console.log(rawData.data.results)
        let arrOfReviews = rawData.data.results
        let totalRating = 0;
        arrOfReviews.forEach((review) => {
          totalRating += review.rating;
        });
        // console.log('totalRating', totalRating)
        // console.log('arrOfReviews.length', arrOfReviews.length)
        this.setState({
          avgStars: totalRating/ arrOfReviews.length
        })
      })
      .catch((err) => console.log('getReviews err: ', err));
  }

  // SALE PRICE STRIKETHOUGH
  salePriceMode() {
    return(
      this.state.sale_price ?
        <div>
          <span style={{ color: 'red' }}>${this.state.sale_price}</span>
          {'  '}
          <span><s>${this.state.original_price}</s></span>
        </div>
      :
        <div>
          <span>${this.state.original_price}</span>
          {/* {' '}
          <em>(Other Styles May Be On Sale!)</em> */}
        </div>
    )
  }

  setSessionStorage() {
    sessionStorage.setItem('productId', this.props.productId);
    // console.log('sessionStorage', Number(sessionStorage.productId));
    this.props.getCurrentProductId();
  }


  render() {
    // ** Potentially deconstruct props?
    // const {
    //   productId
    // } = this.props;
    return (
      <div>
        <div>
          <button className="fas fa-star" type="button" id="modalBtn" onClick={this.handleModal} aria-label="Open"></button>
          <Modal id="modalContainer" isOpen={this.state.modalView} ariaHideApp={false} onRequestClose={this.handleModal} id='modal' style={customStyles}>
            <h3>
              COMPARING
            </h3>
            <table className='modalStyle'>
              <thead>
                <tr>
                  <th>{this.state.name}</th>
                  <th></th>
                  <th>{this.props.productInfo.name}</th>
                </tr>
              </thead>
              <tbody>
              {/* conditional render in order to wait for state to be set to filteredFeatures */}
              {this.state.filteredFeatures ?
                this.state.filteredFeatures.map((feature, key) => {
                  if(feature.value !== null) {
                    if (feature.item === 0) {
                      return (
                        <tr key={key} className='comparisonRow'>
                          <td className='checkMarks'><Checkmark size='small'/></td>
                          <td className='center'>
                            {feature.feature} - {feature.value}
                            <br/>
                          </td>
                          <td className='checkMarks'></td>

                        </tr>
                      )
                    } else if (feature.item === 1) {
                      return (
                        <tr key={key} className='comparisonRow'>
                          <td className='checkMarks'></td>
                          <td className='center'>
                            {feature.feature} - {feature.value}
                            <br/>
                          </td>
                          <td className='checkMarks'><Checkmark size='small'/></td>
                        </tr>
                      )
                    } else if (feature.item === 2) {
                      return (
                        <tr key={key} className='comparisonRow'>
                          <td className='checkMarks'><Checkmark size='small'/></td>
                          <td className='center'>
                            {feature.feature} - {feature.value}
                            <br/>
                          </td>
                          <td className='checkMarks'><Checkmark size='small'/></td>
                        </tr>
                      )
                    }
                  }
                })
                : null
              }
              </tbody>
            </table>
            <button onClick={this.handleModal} aria-label="Close">Back</button>
          </Modal>
          {this.state.thumbnail_url ?
            <div onClick={this.setSessionStorage}>
              <img
                className="cardImg"
                src={this.state.thumbnail_url}
                alt="Picture of a Related Item"
              />
            </div>
            :
            <div onClick={this.setSessionStorage}>
              <div className="cardImg">
                <div className="cardImgNone"> NO IMAGE AVAILABLE</div>
              </div>
            </div>
          }
        </div>
        <div className='cardText'>
          <div style={{fontSize: '14px'}}>
            {this.state.category}
          </div>
          <div style={{fontSize: '20px'}}>
            <b>{this.state.name}</b>
          </div>
          <div style={{fontSize: '14px', margin:'5px 0px'}}>
            {this.salePriceMode()}
          </div>
          <div style={{fontSize: '14px'}}>
            {this.state.avgStars ?
              <RelatedStars avgStars={this.state.avgStars}/>
              :
              <RelatedStars avgStars={0}/>
            }
          </div>
        </div>
      </div>
    );
  }
}

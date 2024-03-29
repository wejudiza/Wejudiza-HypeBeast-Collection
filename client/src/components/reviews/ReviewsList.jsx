import React from 'react';
import Modal from 'react-modal';
import Review from './Review';
import axios from 'axios';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  },
};

class ReviewsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortMethod: 'relevant',
      modalView: false,
      arrOfReviews: [],
      reviewsSliceEnding: 2,
      currentDisplayReviews: [],
      product_id: this.props.currentProduct,
      rating: 5,
      summary: '',
      body: '',
      recommend: true,
      name: '',
      email: '',
      size: 5,
      comfortable: 5,
    };
    this.getReviews = this.getReviews.bind(this);
    this.getCharac = this.getCharac.bind(this);
    this.handleSort = this.handleSort.bind(this);
    this.handleAddReview = this.handleAddReview.bind(this);
    this.handleFormInput = this.handleFormInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleMoreReviewClick = this.handleMoreReviewClick.bind(this);
  }

  // initial data fetching
  componentDidMount() {
    // console.log(this.props.currentProduct)
    this.getReviews();
    this.getCharac();
  }

  // monitors product_id changing in props
  componentDidUpdate(prevProps) {
    if(this.props.currentProduct !== prevProps.currentProduct) {
      this.getReviews();
      this.getCharac();
    }
  }

  // function to get all reviews data for a product and filter data needed
  getReviews() {
    axios.get('api/reviews', {
      params: {
        product_id: this.props.currentProduct,
        sort: this.state.sortMethod
      }
    })
      .then((rawData) => {
        // console.log(rawData.data.results)
        let arrOfReviews = rawData.data.results;
        let currentDisplayReviews;
        (arrOfReviews.length < 3) ? currentDisplayReviews = arrOfReviews.slice() : currentDisplayReviews = arrOfReviews.slice(0, this.state.reviewsSliceEnding);
        let totalRating = 0;
        let totalRecommend = 0;
        let numForRating = {};
        let totalNumForRating = 0;
        if (arrOfReviews.length !== 0) {
          arrOfReviews.forEach((review) => {
            totalRating += review.rating;
            if (review.recommend) {
              totalRecommend ++;
            };
            if (numForRating[review.rating] === undefined) {
              numForRating[review.rating] = 1;
              totalNumForRating++;
            } else {
              numForRating[review.rating] ++;
              totalNumForRating++;
            }
          });
          // console.log(totalNumForRating)
          // console.log(totalRecommend/arrOfReviews.length)
          numForRating['total'] = totalNumForRating;
          // console.log(numForRating)
          this.props.getAverageRatingFromReview(Math.round((totalRating/arrOfReviews.length * 10)) / 10);
          this.props.getPercentageFromReviewsList(Math.floor((totalRecommend/arrOfReviews.length) * 100) + '%');
          this.props.getNumForRating(numForRating);

          // pass data to app.jsx for other components to use
          this.props.getRating(Math.round((totalRating/arrOfReviews.length * 10)) / 10);
          this.props.getTotalReviews(totalNumForRating);
        } else {
          this.props.getAverageRatingFromReview(0);
          this.props.getRating(0);
          this.props.getPercentageFromReviewsList(0);
          this.props.getNumForRating(numForRating);
          this.props.getTotalReviews(0);
        }
        // console.log(currentDisplayReviews)
        this.setState({
          arrOfReviews: arrOfReviews,
          currentDisplayReviews: currentDisplayReviews,
        });
      })
      .catch((err) => {
        console.log(err);
      })
  }

  // function to get meta reviews data from server
  getCharac() {
    axios.get(`api/reviews/meta/${this.props.currentProduct}`)
      .then((rawData) => {
        let charac = rawData.data.characteristics;
        // console.log(charac)
        this.props.getCharacFromReviewsList(charac);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  // function controls modal state change
  handleAddReview() {
    this.setState({
      modalView: !this.state.modalView,
    });
  }

  // function handling click on more reviews button and changing current display item in state
  handleMoreReviewClick() {
    if (this.state.reviewsSliceEnding + 2 < this.state.arrOfReviews.length) {
      this.setState({
        reviewsSliceEnding: this.state.reviewsSliceEnding + 2,
      }, () => {
        this.setState({
          currentDisplayReviews: this.state.arrOfReviews.slice(0, this.state.reviewsSliceEnding),
        });
      });
    } else {
      this.setState({
        reviewsSliceEnding: this.state.arrOfReviews.length,
      }, () => {
        this.setState({
          currentDisplayReviews: this.state.arrOfReviews.slice(0, this.state.reviewsSliceEnding),
        });
      });
    }
  }

  // function handling review sort method input and re-render
  handleSort(e) {
    this.setState({
      sortMethod: e.target.value
    }, ()=> {
      this.getReviews();
    });
  }

  // function handling new review input and save it to state for submission
  handleFormInput(e) {
    e.preventDefault();
    if (e.target.name === 'rating' || e.target.name === 'size' || e.target.name === 'comfortable') {
      this.setState({
        [e.target.name]: Number(e.target.value)
      });
    } else if (e.target.name === 'recommend') {
      if (e.target.value === 'Yes') {
        this.setState({
          [e.target.name]: true
        });
      } else {
        this.setState({
          [e.target.name]: false
        });
      }
    } else {
      this.setState({
        [e.target.name]: e.target.value
      });
    }
  }

  // function handling new review submission
  handleSubmit() {
    axios.post('/api/reviews', {
      product_id: this.props.currentProduct,
      rating: this.state.rating,
      summary: this.state.summary,
      body: this.state.body,
      recommend: this.state.recommend,
      name: this.state.name,
      email: this.state.email,
      photos: [],
      characteristics: {}
    })
      .then((rawData) => {
        // console.log(rawData.data);
        this.setState({
          sortMethod: 'newest',
          modalView: false,
          arrOfReviews: [],
          currentDisplayReviews: [],
          product_id: this.props.currentProduct,
          rating: 5,
          summary: '',
          body: '',
          recommend: true,
          name: '',
          email: '',
          size: 5,
          comfortable: 5,
        }, () => {
          this.getReviews();
        });
      })
      .catch((err) => {
        console.log(rawData.data);
      })
  }

  render() {
    return (
      <div className="container-reviewList">
        <div className="sortbar">{this.state.arrOfReviews.length} reviews, &nbsp;
          <label>sorted by &nbsp;
            <select
              className="select"
              onChange={this.handleSort}
            >
              <option className="option">relevant</option>
              <option className="option">newest</option>
              <option className="option">helpful</option>
            </select>
          </label>
        </div>
        <div className="reviewlistbody">
          <Review
            arrOfReviews={this.state.currentDisplayReviews}
            getReviews={this.getReviews}
          />
        </div>
        <div className="bottonbar">
          {/* show more reviews button only when there are more than 2 reviews */}
          {(this.state.arrOfReviews.length > this.state.currentDisplayReviews.length) ?
            <div>
              <button
                type="button"
                aria-label="More Reviews"
                className="button"
                onClick={this.handleMoreReviewClick}
              >MORE REVIEWS</button><span> </span><span> </span>
              <button
                type="button"
                aria-label="Add Reviews"
                className="button"
                onClick={this.handleAddReview}
              >ADD A REVIEW +</button>
            </div>
            :
            <button
              type="button"
              aria-label="Add Reviews"
              className="button"
              onClick={this.handleAddReview}
            >ADD A REVIEW +</button>
          }
          <Modal
            isOpen={this.state.modalView}
            // use this line to make modal always open for test purpose
            // isOpen={true}
            ariaHideApp={false}
            onRequestClose={this.handleAddReview}
            style={customStyles}
          >
            <div className="newReview">
              <h1>Write Your Review</h1>
              <h2>About the {this.props.productInfo.name}</h2>
              <form
                className="inputForm"
                onChange={this.handleFormInput}
              >
                <label>Rating</label>
                  <select
                    name="rating"
                    style={{
                      width: "100%",
                    }}
                  >
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                  </select><br />
                <label>Level of Fit</label>
                  <select
                    name="size"
                    style={{
                      width: "100%",
                    }}
                  >
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                  </select><br />
                <label>Level of Comfortable</label>
                  <select
                    name="comfortable"
                    style={{
                      width: "100%",
                    }}
                  >
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                  </select><br />
                <label>Summary:</label><br />
                  <textarea
                    name="summary"
                    placeholder="Example: Best purchase ever!"
                    style={{
                      width: "100%",
                      height: "30px",
                    }}
                  ></textarea><br />
                <label>Comments:</label><br />
                  <textarea
                    name="body"
                    placeholder="Why did you like the product or not?"
                    style={{
                      width: "100%",
                      height: "50px",
                    }}
                  ></textarea><br />
                <label>Will you recommend this product?</label>
                  <select
                    name="recommend"
                    style={{
                      width: "100%",
                    }}
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select><br />
                <label>Your Name:</label><br />
                  <textarea
                    name="name"
                    placeholder="Example: jackson11!"
                    style={{
                      width: "100%",
                      height: "30px",
                    }}
                  ></textarea><br />
                <label>Your email:</label><br />
                  <textarea
                    name="email"
                    placeholder="Example: jackson11@email.com"
                    style={{
                      width: "100%",
                      height: "30px",
                    }}
                  ></textarea><br />
                <button
                  type="button"
                  aria-label="Submit"
                  className="button"
                  onClick={this.handleSubmit}
                >Submit</button>
                <button
                  type="button"
                  aria-label="Cancel"
                  className="button"
                  onClick={this.handleAddReview}
                >Cancel</button>
              </form>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}

export default ReviewsList;

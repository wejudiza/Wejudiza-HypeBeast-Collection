import React from 'react';
import Select from 'react-select';
import ReactModal from 'react-modal';
import { Checkmark } from 'react-checkmark';

const modalStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export default class AddToCart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      size: 'Select Size',
      quantity: 0,
      skus: [],
      selectedQ: 0,
      showError: false,
      showModal: false,
      menuIsOpen: false,
      defaultValue: { value: 1, label: 1 },
    };
    this.handleSizeChange = this.handleSizeChange.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.handleModal = this.handleModal.bind(this);
    this.handleSelectReset = this.handleSelectReset.bind(this);
    this.selectedSizeMode = this.selectedSizeMode.bind(this);
    this.onAddToCartClick = this.onAddToCartClick.bind(this);
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.selectRef = null;
  }

  componentDidUpdate(prevProps) {
    if (this.props.currentStyle.style_id !== prevProps.currentStyle.style_id) {
      this.handleSelectReset();
    }
  }

  handleSelectReset() {
    this.selectRef.select.clearValue();
    this.setState({
      size: 'Select Size',
      selectedQ: 0,
      defaultValue: { value: 1, label: 1 },
    });
  }

  handleSizeChange(e) {
    if (!e) {
      this.setState({
        size: 'Select Size',
        quantity: 0,
      });
    } else {
      this.setState({
        size: e.value,
        quantity: e.key,
        selectedQ: 1,
        showError: false,
        menuIsOpen: false,
      });
    }
  }

  handleQuantityChange(e) {
    this.setState({
      selectedQ: e.value,
      defaultValue: { value: e.value, label: e.value },
    });
  }

  handleModal() {
    this.setState({
      showModal: !this.state.showModal,
    });
  }

  onAddToCartClick() {
    if (this.state.size === 'Select Size') {
      this.setState({
        showError: true,
        menuIsOpen: true,
      });
    } else {
      this.setState({
        showModal: true,
      });
    }
  }

  openMenu() {
    this.setState({
      menuIsOpen: true,
    });
  }

  closeMenu() {
    this.setState({
      menuIsOpen: false,
    });
  }

  selectedSizeMode() {
    if (this.state.size !== 'Select Size') {
      let numbers = [...Array(16).keys()];
      numbers.shift();
      if (this.state.quantity < 15) {
        numbers = [...Array(this.state.quantity + 1).keys()];
        numbers.shift();
      }
      const quantities = numbers.map((quantity) => (
        { value: quantity, label: quantity }
      ));
      return (
        <Select
          className="dropdown-quantity"
          options={quantities}
          value={this.state.defaultValue}
          onChange={this.handleQuantityChange}
        />
      );
    }
    return (
      <Select
        className="dropdown-quantity"
        placeholder="-"
        isDisabled
        value={{ value: null, label: '-' }}
        ref={(ref) => {
          this.selectRef = ref;
        }}
      />
    );
  }

  render() {
    const sizes = Object.keys(this.props.skus).map((sku) => (
      { value: this.props.skus[sku].size, label: this.props.skus[sku].size, key: this.props.skus[sku].quantity }
    ));
    return (
      <div>
        <br />
        {this.state.showError && <span style={{ color: 'red' }}>Please select size</span>}
        <div id="dropdown-container">
          <Select
            className="dropdown-size"
            menuIsOpen={this.state.menuIsOpen}
            options={sizes}
            ref={(ref) => {
              this.selectRef = ref;
            }}
            placeholder="Select Size"
            onFocus={this.openMenu}
            onBlur={this.closeMenu}
            onChange={this.handleSizeChange}
            style={{ width: '50%' }}
          />
          {this.selectedSizeMode()}
          <button aria-label="Add To Cart" type="button" id="cart" onClick={this.onAddToCartClick}>Add to Cart</button>
        </div>
        <br />
        <div className="share-button-containter">
          <span style={{ margin: "10px" }} id="share-text">Share:</span>
          <button aria-label="Facebook Link" type="button" className="share-button"><img alt="Facebook" src="/icons/facebook.png" className="icon"/></button>
          <button aria-label="Twitter Link" type="button" className="share-button"><img alt="Twitter" src="/icons/twitter.png" className="icon"/></button>
          <button aria-label="Pinterest Link" type="button" className="share-button"><img alt="Pinterest" src="/icons/pinterest.png" className="icon"/></button>
        </div>
        {this.state.showModal
        && (
        <ReactModal
          isOpen
          style={modalStyle}
          ariaHideApp={false}
          onRequestClose={this.handleModal}
        >
          <p>
            <Checkmark />
            <br />
            <b><u>Added to cart!</u></b>
            <br />
            <div id="cart-container">
              <br />
              Product:
              {' '}
              {this.props.productName}
              <br />
              Style:
              {' '}
              {this.props.currentStyle.name}
              <br />
              Size:
              {' '}
              {this.state.size}
              <br />
              Quantity:
              {' '}
              {this.state.selectedQ}
              <br />
              <img alt="" src={this.props.currentStyle.photos[0].thumbnail_url} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
            </div>
          </p>
          <button aria-label="Close" type="button" onClick={this.handleModal}>Close</button>
        </ReactModal>
        )}
      </div>
    );
  }
}

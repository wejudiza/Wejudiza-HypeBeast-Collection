import React from 'react';

export default class AddToCart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: [],
    };
  }

  render() {
    return (
      <div>
        This is where the AddToCart goes
        <select>
          Choose Size
          <option>--Sizes--</option>
        </select>
        <select>
          Choose Quantity
          <option>--Quantity--</option>
        </select>
        <button type="button" id="cart ">Add to Cart</button>
      </div>
    )
  }
}
import React from 'react';

export default class ProductInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: [],
    };
  }

  render() {
    return (
      <div>
        {this.props.product}
      </div>
    )
  }
}
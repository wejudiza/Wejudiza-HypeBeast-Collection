import React from 'react';
import ProgressBar from "@ramonak/react-progress-bar";

class Status extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ProgressBar
        completed={this.props.completed}
        isLabelVisible={false}
        bgcolor='rgb(250, 128, 114)'
        baseBgColor='lightgrey'
        borderRadius='0'
        width='100%'
        height='10px'
      />
    )
  }
}

export default Status;
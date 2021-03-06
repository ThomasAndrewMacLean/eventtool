import React, { Component } from "react";
import styled from "styled-components";

import ReactDOM from "react-dom";

const Title = styled.h2`
  color: red;
  background-color: green;
`;
class App extends Component {
  render() {
    return <Title>This is a second component!!!</Title>;
  }
}

ReactDOM.render(
  React.createElement(App, {}, null),
  document.getElementById("react-target2")
);

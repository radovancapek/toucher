import React from 'react';
import './App.scss';
import Settings from './components/Settings/Settings';
import HexagonGrid from './components/HexagonGrid/HexagonGrid';
import config from './config.json';
import PortSettings from './components/PortSettings/PortSettings';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSettings: false,
      showPortSettings: false,
      rows: 6,
      cols: 4,
      hexagonSize: 48,
      firstDown: false,
      actCodes: config.codes
    }
  }
  showSettings = () => {
    this.setState({
      showSettings: !this.state.showSettings,
      showPortSettings: false
    });
  }
  showPortSettings = () => {
    this.setState({
      showPortSettings: !this.state.showPortSettings,
      showSettings: false
    });
  }
  createGrid = (rows, cols, hexSize, newCodes) => {
    this.setState({
      rows: rows,
      cols: cols,
      hexagonSize: hexSize,
      actCodes: newCodes
    })
  }

  resetCodes = () => {
    this.setState({ actCodes: config.codes });
  }

  render() {
    return (
      <div className="App">
        <div className="header">
          <button className="button" onClick={this.showSettings}>{this.state.showSettings ? "X" : "Grid settings"}</button>
          <button className="button" onClick={this.showPortSettings}>{this.state.showPortSettings ? "X" : "Port settings"}</button>
        </div>
        <div className="content">
          <HexagonGrid rows={this.state.rows} cols={this.state.cols} hexagonSize={this.state.hexagonSize} firstDown={this.state.firstDown} codes={this.state.actCodes} />
          <Settings show={this.state.showSettings} createGrid={this.createGrid} codes={this.state.actCodes} resetCodes={this.resetCodes} />
          <PortSettings show={this.state.showPortSettings} />
        </div>
      </div>
    )
  }

}

export default App;

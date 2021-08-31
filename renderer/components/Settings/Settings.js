import './Settings.scss';
import React from 'react';
import SettingGrid from './SettingGrid';
const fs = window.require('fs');
const { ipcRenderer } = window.require("electron");

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: 6,
            cols: 4,
            hexSize: 48,
            createGrid: false,
            actCodes: this.props.codes
        }
        this.defaults = {
            rows: 6,
            cols: 4,
            hexSize: 48
        }
    }

    componentDidMount() {
        ipcRenderer.on("saveSettings", (event, arg) => {
            if ((arg != null) && !arg.canceled && arg.filePath) this.saveFile(arg.filePath);
            else console.log("Error saving file");
        });
        ipcRenderer.on("loadSettings", (event, arg) => {
            if ((arg != null) && !arg.canceled && arg.filePaths) this.loadFile(arg.filePaths[0]);
            else console.log("Error loading file");
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.codes !== this.props.codes) {
            this.setState({ actCodes: this.props.codes });
        }
    }

    updateCodes = (newCodes) => {
        this.setState({ actCodes: newCodes });
    }

    handleCreateGridClick = () => {
        this.setState({ createGrid: !this.state.createGrid })
        this.props.createGrid(this.state.rows, this.state.cols, this.state.hexSize, this.state.actCodes);
    }

    handleResetClick = () => {
        this.setState({
            rows: this.defaults.rows,
            cols: this.defaults.cols,
            hexSize: this.defaults.hexSize,
            actCodes: this.props.codes
        })
        this.props.resetCodes();
        this.rows = this.defaults.rows;
        this.cols = this.defaults.cols;
    }

    handleSaveSettings = () => {
        ipcRenderer.send("openSaveDialog");
    }

    handleLoadSettings = () => {
        ipcRenderer.send("openLoadDialog");
    }

    saveFile = (path) => {
        const settingsObj = {
            rows: this.state.rows,
            cols: this.state.cols,
            size: this.state.hexSize,
            codes: this.state.actCodes
        }
        let settings = JSON.stringify(settingsObj);
        let fileSaved = fs.writeFileSync(path, settings);
        console.log("file", fileSaved);
    }

    loadFile = async (path) => {
        await fs.readFile(path, 'utf8' , (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            const newSettings = JSON.parse(data);
            this.setState({
                rows: newSettings.rows,
                cols: newSettings.cols,
                hexSize: newSettings.size,
                actCodes: newSettings.codes
            });
          })
    }

    handleChange = (e) => {
        let hexagonCount = (e.target.name === "rows") ? (e.target.value * this.state.cols) : (e.target.value * this.state.rows);
        let actCodesCount = this.state.actCodes.length;
        if (hexagonCount > actCodesCount) {
            let emptyCodes = [];
            for (let i = 0; i < (hexagonCount - actCodesCount); i++) {
                emptyCodes.push([0, 0, 0]);
            }
            this.setState({
                actCodes: [...this.state.actCodes, ...emptyCodes],
                [e.target.name]: e.target.value
            });
        } else {
            this.setState({ [e.target.name]: e.target.value });
        }
    }

    render() {
        const show = this.props.show ? " show" : "";
        return (
            <div className={"Settings" + show}>
                <div className="gridSettings">
                    <div className="inputs">
                        <div className="rows">
                            <label>Rows:</label><input value={this.state.rows} name="rows" onChange={this.handleChange} />
                        </div>
                        <div className="cols">
                            <label>Columns:</label><input value={this.state.cols} name="cols" onChange={this.handleChange} />
                        </div>
                        <div className="hexSize">
                            <label>Hexagon size:</label><input value={this.state.hexSize} name="hexSize" onChange={this.handleChange} />
                        </div>
                    </div>
                    <div className="buttons">
                        <button className="button" onClick={this.handleLoadSettings}>Load settings</button>
                        <button className="button" onClick={this.handleSaveSettings}>Save settings</button>
                        <button className="button" onClick={this.handleCreateGridClick}>Create grid</button>
                        <button className="button" onClick={this.handleResetClick}>Reset</button>
                    </div>
                </div>
                <SettingGrid rows={this.state.rows} cols={this.state.cols} codes={this.state.actCodes} updateCodes={this.updateCodes} />
            </div>
        )
    }
}

export default Settings;
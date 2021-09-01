import React from 'react';
import './PortSettings.scss';
import { FaSyncAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Select from 'react-select';
const { ipcRenderer } = window.require("electron");

class PortSettings extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            portOptions: [],
            rateOptions: [],
            loadingPorts: false,
            selectedPortOption: null,
            selectedBaudRateOption: null,
            connected: false,
            error: null,
            change: false
        }
        this.baudRates = [115200, 57600, 38400, 31250, 28800, 19200, 14400, 9600, 4800, 2400, 1200, 600, 300];
        this.port = null;
        this.rate = null;
    }

    componentDidMount() {
        ipcRenderer.send('ports');
        ipcRenderer.send('isConnected');
        ipcRenderer.on('portOpened', (event, arg) => {
            if (arg[0]) {
                this.setState({
                    error: null,
                    change: false,
                    selectedPortOption: { value: arg[1], label: arg[1].path },
                    selectedBaudRateOption: { value: arg[2], label: arg[2] }
                });
            }
            this.setState({ connected: arg[0] });
        })
        ipcRenderer.on('error', (event, arg) => {
            this.setState({ error: arg.message });
        })
        ipcRenderer.on('portClosed', (event) => {
            this.setState({ connected: false, selectedPortOption: null });
        })
        ipcRenderer.on('ports', (event, ports) => {
            let portsArray = JSON.parse(ports);
            portsArray.push({ path: "COM4" }, { path: "COM5" });
            let options = [];
            portsArray.map(port => {
                options.push({ value: port, label: port.path });
                return null;
            });
            let rateOptions = [];
            this.baudRates.map(rate => {
                rateOptions.push({ value: rate, label: rate });
                return null;
            })
            this.setState({
                portOptions: options,
                rateOptions: rateOptions,
                loadingPorts: false,
                mounted: true
            });
        })
    }

    handlePortChange = (option) => {
        if (this.state.selectedPortOption && (this.state.selectedPortOption.value.path === option.value.path))
            this.setState({ selectedPortOption: option });
        else
            this.setState({ selectedPortOption: option, change: true });
    }

    handleBaudRateChange = (option) => {
        if (this.state.selectedBaudRateOption && (this.state.selectedBaudRateOption.value === option.value))
            this.setState({ selectedBaudRateOption: option });
        else
            this.setState({ selectedBaudRateOption: option, change: true });
    }

    reconnect = () => {
        this.setState({ error: null, change: false });
        ipcRenderer.send("reconnect", [this.state.selectedPortOption.value, this.state.selectedBaudRateOption.value]);
    }

    render() {
        const buttonsDisabled = !this.state.selectedPortOption || !this.state.selectedBaudRateOption;
        const show = this.props.show ? " show" : "";
        return (
            <div className={"PortSettings" + show}>
                <div className="selectWrapper ports">
                    <div className="label">Port:</div>
                    {(this.state.portOptions.length > 0) ? (
                        <Select className="select"
                            options={this.state.portOptions}
                            onChange={this.handlePortChange}
                            value={this.state.selectedPortOption}
                        />
                    ) : (
                        <div className="noPorts">No available ports</div>
                    )}
                </div>
                <div className="selectWrapper baudRate">
                    <div className="label">Baud rate:</div>
                    <Select className="select"
                        options={this.state.rateOptions}
                        onChange={this.handleBaudRateChange}
                        value={this.state.selectedBaudRateOption}
                    />
                </div>
                <div className="confirm">
                    <button className="button reconnect" disabled={buttonsDisabled} onClick={this.reconnect}>{this.state.connected ? "Reconnect" : "Connect"}</button>
                    {this.state.connected ? (
                        <div>
                            <FaCheckCircle className="icon green" />
                        </div>
                    ) : <FaTimesCircle className="icon red" />}
                    {this.state.error && <div className="error">{this.state.error}</div>}
                </div>
            </div>
        )
    }
}

export default PortSettings;
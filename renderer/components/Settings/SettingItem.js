import './SettingItem.scss';
import React from 'react';

class SettingItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first: this.props.code[0] || 0,
            second: this.props.code[1] || 0,
            third: this.props.code[2] || 0
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.code !== this.props.code) {
            this.setState({
                first: this.props.code[0],
                second: this.props.code[1],
                third: this.props.code[2]
            });
        }
    }

    handleChange = (e) => {
        const name = e.target.name;
        const value = parseInt(e.target.value);
        this.setState({ [name]: value }, () => {
            this.props.updateCode(this.props.index, [this.state.first, this.state.second, this.state.third]);
        });
    }

    render() {
        return (
            <div className="SettingItem" key={this.props.index}>
                <select name="first" onChange={this.handleChange} value={this.state.first}>
                    <option>0</option>
                    <option>1</option>
                    <option>2</option>
                    <option>4</option>
                    <option>8</option>
                    <option>16</option>
                    <option>32</option>
                    <option>64</option>
                    <option>128</option>
                </select>
                <select name="second" onChange={this.handleChange} value={this.state.second}>
                    <option>0</option>
                    <option>1</option>
                    <option>2</option>
                    <option>4</option>
                    <option>8</option>
                    <option>16</option>
                    <option>32</option>
                    <option>64</option>
                    <option>128</option>
                </select>
                <select name="third" onChange={this.handleChange} value={this.state.third}>
                    <option>0</option>
                    <option>1</option>
                    <option>2</option>
                    <option>4</option>
                    <option>8</option>
                    <option>16</option>
                    <option>32</option>
                    <option>64</option>
                    <option>128</option>
                </select>
            </div>
        )
    }
}

export default SettingItem;
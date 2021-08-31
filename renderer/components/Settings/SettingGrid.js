import './SettingGrid.scss';
import React from 'react';
import SettingItem from './SettingItem';

class SettingGrid extends React.Component {
    shouldComponentUpdate(nextProps) {
        if((nextProps.rows * nextProps.cols) > nextProps.codes.length) return false;
        else return true;
    }

    updateCode = (index, code) => {
        let newCodes = [...this.props.codes];
        newCodes[index] = code;
        this.props.updateCodes(newCodes);
    }

    render() {
        const settingItems = [];
        for (let i = 0; i < this.props.rows * this.props.cols; i++) {
            settingItems.push(<SettingItem key={i} code={this.props.codes[i]} index={i} updateCode={this.updateCode} />);
        }
        return (
            <div className="SettingGrid" style={{gridTemplateRows: 'repeat(' + this.props.rows + ', 1fr)'}}>
                {settingItems}
            </div>
        )
    }
}

export default SettingGrid;
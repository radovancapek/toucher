import React from 'react';
import './HexagonWrapper.scss';
import { Polygon } from 'react-svg-path'

class HexagonWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            points: []
        }
    }

    render() {
        const hexagon = this.props.hexagon;
        const fillColor = hexagon.active ? "#00ff00" : "#dddddd";
        return (
            <div className="HexagonWrapper" key={this.key} style={{height: this.props.height, width: this.props.width}}>
                <div className="center" style={{top: hexagon.center[1] - 1 + "px", left: hexagon.center[0] - 1 + "px"}}></div>
                <svg>
                    <Polygon
                        points={hexagon.hexaPoints}
                        stroke="#0e98dd"
                        strokeWidth={1}
                        fill={fillColor}
                    />
                </svg>
            </div>
        )
    }
}

export default HexagonWrapper;
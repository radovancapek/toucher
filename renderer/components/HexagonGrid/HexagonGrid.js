import './HexagonGrid.scss';
import React from 'react';
import HexagonWrapper from './HexagonWrapper';
import Hexagon from '../../models/Hexagon';
import { Buffer } from 'buffer';
const { ipcRenderer } = window.require('electron');

class HexagonGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hexagons: [],
            closestPoint: null,
            rows: 0,
            cols: 0
        }
        this.coords = [];
        this.lastDataToSend = [0, 0, 0, 0];
        this.mouseDown = false;
        this.timer = null;
        this.enabled = true;
    }

    componentDidUpdate(prevProps) {
        if((this.props.rows !== prevProps.rows) || (this.props.cols !== prevProps.cols) || (this.props.hexagonSize !== prevProps.hexagonSize) || (this.props.codes !== prevProps.codes)) {
            this.createGrid(this.props.rows, this.props.cols, this.props.hexagonSize, this.props.firstDown, this.props.codes);
        }
    }

    componentDidMount() {
        this.createGrid(this.props.rows, this.props.cols, this.props.hexagonSize, this.props.firstDown, this.props.codes);
        ipcRenderer.send('open');
    }

    getCursorCoords = (e) => {
        let bounds = e.currentTarget.getBoundingClientRect();
        let x = e.clientX - bounds.left;
        let y = e.clientY - bounds.top;
        return [x, y];
    }

    createGrid = (rows, cols, hexagonWidth, firstDown, codes) => {
        let pinMap = codes
        let hexagons = [];
        const a = hexagonWidth / 2;
        const r = a * (Math.sqrt(3) / 2);
        let xPos = a;
        let yPos = r;
        if (!firstDown) yPos += r;
        let index = 0;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                hexagons.push(new Hexagon([xPos, yPos], hexagonWidth, index, pinMap[index]));
                yPos += 2 * r;
                index++;
            }
            xPos += 1.5 * a;
            yPos = (i % 2 === 0) ? r : (2 * r);
        }
        const width = cols/2 * hexagonWidth + cols/2 * a + a/2;
        const height = (parseInt(rows)) * 2 * r + r;
        this.setState({ hexagons: hexagons, gridHeight: height, gridWidth: width });
    }

    disableDrag = (e) => {
        e.preventDefault();
    }

    handleMouseDown = (e) => {
        this.mouseDown = true;
        this.coords = this.getCursorCoords(e);
        this.lastDataToSend = [0, 0, 0, 0];
        this.findClosestPoint(this.coords[0], this.coords[1]);
    }

    handleMouseMove = (e) => {
        const newCoords = this.getCursorCoords(e);
        if (this.mouseDown && newCoords !== this.coords) {
            this.findClosestPoint(newCoords[0], newCoords[1]);
        }
    }

    handleMouseUp = () => {
        this.mouseDown = false;
        let buffer = Buffer.from([0, 0, 0, 0]);
        ipcRenderer.send('touch', buffer);
        this.state.hexagons.map((hexagon) => {
            hexagon.active = false;
            return null;
        })
        this.setState({ closestPoint: null });
    }

    findClosestPoint = (x, y) => {
        let minDist = Number.MAX_VALUE;
        let closestPoint = [0, 0];
        let hexagonsFound = [];
        this.state.hexagons.map((hexagon) => {
            hexagon.active = false;
            if ((Math.abs(x - hexagon.center[0]) <= hexagon.size) && (Math.abs(y - hexagon.center[1]) <= hexagon.size)) {

                //center
                let dist = Math.sqrt(Math.pow(hexagon.center[0] - x, 2) + Math.pow(hexagon.center[1] - y, 2));
                if (dist < minDist) {
                    minDist = dist;
                    closestPoint = hexagon.center;
                    hexagonsFound = [];
                    hexagonsFound.push(hexagon);
                }

                // 2 hexagons
                hexagon.edgePoints.map(point => {
                    dist = Math.sqrt(Math.pow(point[0] - x, 2) + Math.pow(point[1] - y, 2));
                    if (dist <= minDist) {
                        if (dist < minDist) {
                            hexagonsFound = [];
                            minDist = dist;
                            closestPoint = point;
                        }
                        hexagonsFound.push(hexagon);
                    }
                    return null;
                })

                // 3 hexagons
                hexagon.hexaPoints.map(point => {
                    dist = Math.sqrt(Math.pow(point[0] - x, 2) + Math.pow(point[1] - y, 2));
                    if (dist <= minDist) {
                        if (dist < minDist) {
                            hexagonsFound = [];
                            minDist = dist;
                            closestPoint = point;
                        }
                        hexagonsFound.push(hexagon);
                    }
                    return null;
                })
            }
            return null;
        })
        let result = [0, 0, 0, 1];
        if ((hexagonsFound.length !== 0)) {
            hexagonsFound.map(hexagon => {
                hexagon.active = true;
                result[0] += hexagon.pin[0];
                result[1] += hexagon.pin[1];
                result[2] += hexagon.pin[2];
                return null;
            })
            if (JSON.stringify(result) !== JSON.stringify(this.lastDataToSend)) {
                this.lastDataToSend = result;
                let buffer = Buffer.from(result);
                ipcRenderer.send('touch', buffer);
            }

        }
        this.setState({ closestPoint: closestPoint });
    }

    componentWillUnmount() {
        ipcRenderer.send('close');
    }

    render() {
        const hexagons = this.state.hexagons.map((hexagon, i) => {
            return (<HexagonWrapper key={i} hexagon={hexagon} height={this.state.gridHeight} width={this.state.gridWidth} />);
        })
        return (
            <div className="HexagonGrid">
                <div className="gridWrapper" style={{ height: this.state.gridHeight, width: this.state.gridWidth }} onMouseDown={this.handleMouseDown} onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp} onDragStart={this.disableDrag} onDrop={this.disableDrag} onDrag={this.disableDrag}>
                    {hexagons}
                    {this.state.closestPoint && (
                        <div className="cursor" style={{ top: this.state.closestPoint[1] - 1 + "px", left: this.state.closestPoint[0] - 1 + "px" }}></div>
                    )}
                </div>
            </div>
        )
    }
}

export default HexagonGrid;
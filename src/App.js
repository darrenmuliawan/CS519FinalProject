import logo from './logo.svg';
import './App.css';
import TextField from '@material-ui/core/TextField';
import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Button } from '@material-ui/core';

export const App = () => {
  const [numOfPeople, setNumOfPeople] = useState(5);
  const [roomWidth, setRoomWidth] = useState(80);
  const [roomLength, setRoomLength] = useState(50);
  const [people, setPeople] = useState([]);
  const [simulationBegin, setSimulationBegin] = useState(false);
  const [intervalId, setIntervalId] = useState();

  const PERSON_RADIUS = 10;
  let margin = {
    top: 20,
    bottom: 20,
    right: 20,
    left: 20
  }
  let width = (roomWidth * 15) - margin.left - margin.right;
  let height = (roomLength * 15) - margin.top - margin.bottom;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = './d3-floorplan/d3.floorplan.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, [])

  useEffect(() => {
    renderRoom();
  }, [roomWidth, roomLength, numOfPeople])

  const renderParameterCard = () => {
    return (
      <div className="card">
        <p className="card__title">Parameters</p>
        <TextField
          className="number-input"
          label="# of people"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          value={numOfPeople}
          onChange={(e) => setNumOfPeople(parseInt(e.target.value) < 1 ? 1 : parseInt(e.target.value))}
        />
        <TextField
          className="number-input"
          label="Bldg. Length (in Ft)"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          value={roomLength}
          onChange={(e) => setRoomLength(parseInt(e.target.value) < 1 ? 1 : parseInt(e.target.value))}
        />
        <TextField
          className="number-input"
          label="Bldg. Width (in Ft)"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          value={roomWidth}
          onChange={(e) => setRoomWidth(parseInt(e.target.value) < 1 ? 1 : parseInt(e.target.value))}
        />
        {
          !simulationBegin
          ?
          <Button variant="contained" color="primary" onClick={startSimulation}>Start Simulation</Button>
          :
          <Button variant="contained" color="secondary" onClick={stopSimulation}>Stop Simulation</Button>
        }
      </div>
    )
  }

  const renderRoom = () => {
    // RESET CHART
    d3.select('#chart').selectAll('*').remove();

    let x = d3.scaleLinear().domain([0, roomWidth]).range([0, width])
    let y = d3.scaleLinear().domain([0, roomLength]).range([height, 0])

    let svg = 
    d3.select('#chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.left + margin.right)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('id', 'chart-group')

    let y0 = y(0)
    let y_max = y(roomLength);
    let x0 = x(0);
    let x_max = x(roomWidth);
    
    // CREATE THE ROOM FLOOR PLAN
    svg.append('line')
    .style('stroke', '#000000')
    .attr("x1", x0)
    .attr("y1", y0)
    .attr("x2", x0)
    .attr("y2", y_max)

    svg.append('line')
    .style('stroke', '#000000')
    .attr("x1", x0)
    .attr("y1", y_max)
    .attr("x2", x_max)
    .attr("y2", y_max)

    svg.append('line')
    .style('stroke', '#000000')
    .attr("x1", x_max)
    .attr("y1", y0)
    .attr("x2", x_max)
    .attr("y2", y_max)

    svg.append('line')
    .style('stroke', '#000000')
    .attr("x1", x0)
    .attr("y1", y0)
    .attr("x2", x_max)
    .attr("y2", y0)

    // RENDER LEFT ROOM
    svg.append('line')
    .style('stroke', '#000000')
    .attr("x1", x(0.3 * roomWidth))
    .attr("y1", x(0))
    .attr("x2", x(0.3 * roomWidth))
    .attr("y2", y(0.8 * roomLength))

    svg.append('line')
    .style('stroke', '#000000')
    .attr("x1", x(0.3 * roomWidth))
    .attr("y1", y(0.7 * roomLength))
    .attr("x2", x(0.3 * roomWidth))
    .attr("y2", y(0.4 * roomLength))

    svg.append('line')
    .style('stroke', '#000000')
    .attr("x1", x(0))
    .attr("y1", y(0.5 * roomLength))
    .attr("x2", x(0.3 * roomWidth))
    .attr("y2", y(0.5 * roomLength))

    svg.append('line')
    .style('stroke', '#000000')
    .attr("x1", x(0.3 * roomWidth))
    .attr("y1", y(0))
    .attr("x2", x(0.3 * roomWidth))
    .attr("y2", y(0.3 * roomLength))

    if (svg) {
      renderPerson(svg, x, y);
    }
  }

  const renderPerson = (svg, x, y) => {    
    let personArray = [];
    for (let i = 0; i < numOfPeople; i++) {
      let rand_x = Math.random();
      let rand_y = Math.random();
      let x_pos = x(rand_x * roomWidth);
      let y_pos = y(rand_y * roomLength);

      // CREATE PERSON OBJECT
      let person = {
        id: i,
        x: x_pos,
        y: y_pos
      }

      // RENDER DOT
      svg.append('circle')
      .attr("cx", x_pos)
      .attr("cy", y_pos)
      .attr("r", PERSON_RADIUS)
      .style("fill", "red")

      // RENDER WARNING RADIUS
      svg.append('circle')
      .attr("cx", x_pos)
      .attr("cy", y_pos)
      .attr("r", x(6))
      .style("fill", "red")
      .style("opacity", 0.25)

      // PUSH PERSON TO ARRAY
      personArray.push(person);
    }
    setPeople(personArray);
  }
  console.log(people);

  const startSimulation = () => {
    setSimulationBegin(true);
    let x = d3.scaleLinear().domain([0, roomWidth]).range([0, width])
    let y = d3.scaleLinear().domain([0, roomLength]).range([height, 0])

    let intervalId = setInterval(() => {
      let new_people = [...people];
      let svg = d3.select("#chart-group");
      svg.selectAll('circle').remove();
      
      for (let i = 0; i < numOfPeople; i++) {
        // CREATE RANDOM STEP
        let min_x = 0;
        let min_y = 0;
        let max_x = width;
        let max_y = height;

        // RANDOM X DIRECTION
        let x_direction_possibility = []
        if (new_people[i].x - 15 >= min_x) {
          x_direction_possibility.push(-15);
        }
        if (new_people[i].x + 15 <= max_x) {
          x_direction_possibility.push(15);
        }
        let new_x_pos = new_people[i].x + x_direction_possibility[Math.floor(Math.random() * x_direction_possibility.length)]
        new_people[i].x = new_x_pos;

        // RANDOM Y DIRECTION
        let y_direction_possibility = []
        if (new_people[i].y - 15 >= min_y) {
          y_direction_possibility.push(-15);
        }
        if (new_people[i].y + 15 <= max_y) {
          y_direction_possibility.push(15);
        }
        let new_y_pos = new_people[i].y + y_direction_possibility[Math.floor(Math.random() * y_direction_possibility.length)]
        new_people[i].y = new_y_pos;

        // RENDER DOT
        svg.append('circle')
        .attr("cx", new_x_pos)
        .attr("cy", new_y_pos)
        .attr("r", PERSON_RADIUS)
        .style("fill", "red")
  
        // RENDER WARNING RADIUS
        svg.append('circle')
        .attr("cx", new_x_pos)
        .attr("cy", new_y_pos)
        .attr("r", x(6))
        .style("fill", "red")
        .style("opacity", 0.25)
      }
      setPeople(new_people);
    }, 500);
    setIntervalId(intervalId);
  }

  const stopSimulation = () => {
    setSimulationBegin(false);
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
  
  return (
    <div className="App">
      <div className="map-container">
        <p className="app-title">COVID-19 Building Heatmap</p>
        <svg id="chart"/>
      </div>
      {renderParameterCard()}
    </div>
  );
}

export default App;

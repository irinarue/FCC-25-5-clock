import './App.css';
import React, {Component} from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider, connect } from 'react-redux';

//Redux
const defaultState = {
  break: 5,
  session: 25,
  sessionMode: true,
  IsRunning: false
};

const INC_BREAK = "INC_BREAK";
const DEC_BREAK = "DEC_BREAK";
const INC_SESSION = "INC_SESSION";
const DEC_SESSION = "DEC_SESSION";
const CHANGE_MODE = "CHANGE_MODE";
const PLAY_PAUSE = "PLAY_PAUSE";
const RESET = "RESET";

const reducer = (state = defaultState, action) => {
  switch(action.type){
    case INC_BREAK:
      return {
        ...state,
        break: state.break < 60 ? state.break + 1 : state.break};
    case DEC_BREAK:
      return {
        ...state,
        break: state.break > 1 ? state.break - 1 : state.break};
    case INC_SESSION:
      return {
        ...state,
        session: state.session < 60 ? state.session + 1 : state.session};
    case DEC_SESSION:
      return {
        ...state,
        session: state.session > 1 ? state.session - 1 : state.session};
    case CHANGE_MODE:
      return {
        ...state,
        sessionMode: !state.sessionMode};
    case PLAY_PAUSE:
      return {
        ...state,
        isRunning: !state.isRunning};
    case RESET:
      return {
        ...defaultState};
    default:
      return state
  };
};

const store = configureStore({ reducer });

const incBreakAction = () => ({type: INC_BREAK});
const decBreakAction = () => ({type: DEC_BREAK});
const incSessionAction = () => ({type: INC_SESSION});
const decSessionAction = () => ({type: DEC_SESSION});
const changeModeAction = () => ({type: CHANGE_MODE});
const playPausAction = () => ({type: PLAY_PAUSE});
const resetAction = () => ({type: RESET});


//React

class Break extends Component {
  constructor(props){
    super(props);
    this.incBreak = this.incBreak.bind(this);
    this.decBreak = this.decBreak.bind(this);
  };

  incBreak(){
    if (this.props.break < 60 ) {
    this.props.incBreakActionCall(); };
  };

  decBreak(){
    if (this.props.break > 1 ) {
    this.props.decBreakActionCall(); };
  };

  render() {    
    return(
      <div id='break-component'>
        <h3 id='break-label'>Break Length</h3>
        <button id='break-decrement' onClick={this.decBreak}>-</button>
        <span id='break-length'>{this.props.break}</span>
        <button id='break-increment' onClick={this.incBreak}>+</button>
      </div>
    );
  };
};

class Session extends Component {
  constructor(props){
    super(props);
    this.incSession = this.incSession.bind(this);
    this.decSession = this.decSession.bind(this);
  };

  incSession(){
    if (this.props.session < 60 ) {
    this.props.incSessionActionCall();};
  };

  decSession(){
    if (this.props.session > 1 ) {
    this.props.decSessionActionCall();};
  };

  render() {    
    return(
      <div id='session-component'>
        <h3 id='session-label'>Session Length</h3>
        <button id='session-decrement' onClick={this.decSession}>-</button>
        <span id='session-length'>{this.props.session}</span>
        <button id='session-increment' onClick={this.incSession}>+</button>
      </div>
    );
  };
};

class Timer extends Component {
  constructor(props){
    super(props);
    this.state = {
      mode: this.props.sessionMode ? "Session" : "Break",
      currentTime: `${this.props.session}:00`,
      timerInterval: null,
      timerIsRunning: false,
      count: 1
    };

    this.reset = this.reset.bind(this);
    this.startOrStop = this.startOrStop.bind(this);
    this.updateState = this.updateState.bind(this);
    this.switchMode = this.switchMode.bind(this);
    this.runTimer = this.runTimer.bind(this);
  };

  componentDidMount() {
    this.unsubscribe = store.subscribe(this.updateState);
  }

  componentWillUnmount() {
    this.unsubscribe();
    clearInterval(this.state.timerInterval);
  }

  updateState() {
    const state = store.getState();
    const mode = state.sessionMode ? "Session" : "Break";
    const time = state.sessionMode ? state.session : state.break;
    const formattedTime = ('0' + time).slice(-2)
    this.setState({
      mode: mode,
      currentTime: `${formattedTime}:00`
    });
  } 

  reset(){
    clearInterval(this.state.timerInterval);
    this.props.resetActionCall();
    this.setState({
      mode: this.props.sessionMode ? "Session" : "Break",
      timerIsRunning: false,
      timerInterval: null,
      count: 1
    });
  };

  switchMode() {
    clearInterval(this.state.timerInterval);
    this.props.changeModeActionCall();  
    
    setTimeout(() => {
    const state = store.getState();
    const newMode = state.sessionMode ? "Session" : "Break";
    const time = state.sessionMode ? state.session : state.break;
    const formattedTime = ('0' + time).slice(-2);

    this.setState({
      mode: newMode,
      currentTime: `${formattedTime}:00`,
      count: 1,
    });

    this.runTimer();
  }, 0);
  }

  runTimer() {
    if(this.state.timerInterval !== null) {
      clearInterval(this.state.timerInterval);
    }

    let [minutes, seconds] = this.state.currentTime.split(":").map(Number);
    let totMiliseconds = (minutes * 60 + seconds) * 1000;

    // let alarm = new Audio('alarm.mp3');

    const timeInterval = setInterval(() => {
        let timeLeft = totMiliseconds - (1000 * this.state.count);
      if (timeLeft >= 0) {
        let newMinutes = Math.floor(timeLeft/(1000 *60));
        let formattedMinutes = ('0' + newMinutes).slice(-2);
        let newSeconds = Math.floor((timeLeft/1000) % 60);
        let formattedSeconds = ('0' + newSeconds).slice(-2);

        let text = `${formattedMinutes}:${formattedSeconds}`;

        this.setState((prevState)=>({
         currentTime: text,
         count: prevState.count +1,
        }));
      } else {
       // alarm.play();
        clearInterval(this.state.timerInterval); 
        this.switchMode();
      }
    }, 1000);

    this.setState({
      timerInterval: timeInterval
    });
  }

  startOrStop(){
    if(!this.state.timerIsRunning){
      this.runTimer();
      this.setState({
        timerIsRunning: true,
        count: 1,
      });       
    } else {
      clearInterval(this.state.timerInterval);
      this.setState({
        timerIsRunning: false,
        timerInterval: null,
        count: 1,
      })
    }
  }

  render() {
    return(
      <div id='timer-component'>
        <h2 id='timer-label'>{this.state.mode}</h2>
        <div id="time-left">{this.state.currentTime}</div>
        <button id='start_stop' onClick={this.startOrStop}>start/stop</button>
        <button id='reset' onClick={this.reset}>reset</button>
      </div>
    );
  };
};

//React Redux

const mapStateToProps = (state) => ({
  break: state.break,
  session: state.session,
  sessionMode: state.sessionMode,
  timerIsRunning: state.isRunning,
});

const mapDispatchToProps = (dispatch) => {
  return {
    incBreakActionCall: function(){dispatch(incBreakAction())},
    decBreakActionCall: function(){dispatch(decBreakAction())},
    incSessionActionCall: function(){dispatch(incSessionAction())},
    decSessionActionCall: function(){dispatch(decSessionAction())},
    changeModeActionCall: function(){dispatch(changeModeAction())},
    playPausActionCall: function(){dispatch(playPausAction())},
    resetActionCall: function(){dispatch(resetAction())},
  };
};

const ConnectedBreak = connect(mapStateToProps,mapDispatchToProps)(Break);
const ConnectedSession = connect(mapStateToProps,mapDispatchToProps)(Session);
const ConnectedTimer = connect(mapStateToProps,mapDispatchToProps)(Timer);

class App extends Component{
  render(){
    return (
      <Provider store={store}>
        <h1>25 - 5 CLOCK</h1>
        <div className='lengths'>
          <ConnectedBreak />
          <ConnectedSession />
        </div>
        <ConnectedTimer />
      </Provider>
    );
  };
};

export default App;

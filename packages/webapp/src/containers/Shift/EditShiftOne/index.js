import React, {Component} from "react";
import {connect} from 'react-redux';
import styles from '../styles.scss';
import DateContainer from '../../../components/Inputs/DateContainer';
import PageTitle from '../../../components/PageTitle';
import moment from 'moment';
import BedImg from '../../../assets/images/log/bed.svg';
import {taskTypeSelector, selectedShiftSelector} from './selectors';
import {getTaskTypes, addTaskType, setSelectedTasks, setShiftDuration, setStartEndInState} from "../actions";
import {Grid, Row, Col, Button, Alert} from 'react-bootstrap';
import OtherImg from '../../../assets/images/log/other.svg';
import DeliveryImg from '../../../assets/images/log/delivery.svg';
import FertImg from '../../../assets/images/log/fertilizing.svg';
import HarvestImg from '../../../assets/images/log/harvest.png';
import PestImg from '../../../assets/images/log/bug.svg';
import SaleImg from '../../../assets/images/log/sale.svg';
import ScoutImg from '../../../assets/images/log/scout.svg';
import SeedImg from '../../../assets/images/log/seeding.svg';
import SocialImg from '../../../assets/images/log/social.svg';
import WashImg from '../../../assets/images/log/wash.svg';
import WeedImg from '../../../assets/images/log/weed.svg';
import closeButton from '../../../assets/images/grey_close_button.png'
import Popup from "reactjs-popup";
import history from '../../../history';
import {toastr} from 'react-redux-toastr';
import {farmSelector} from '../../selector';
import {grabCurrencySymbol} from "../../../util";


class EditShiftOne extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      new_start: moment().format('HH:mm'),
      new_end: moment().format('HH:mm'),
      break_duration: 0,
      touchAction: 'auto',
      defaultTaskNames: ['Bed Preparation', 'Delivery', 'Fertilizing', 'Harvesting', 'Pest Control', 'Sales', 'Scouting', 'Seeding', 'Social Event', 'Wash and Pack', 'Weeding', 'Other'],
      imgDict: {
        'Bed Preparation': BedImg,
        'Delivery': DeliveryImg,
        'Fertilizing': FertImg,
        'Harvesting': HarvestImg,
        'Pest Control': PestImg,
        'Sales': SaleImg,
        'Scouting': ScoutImg,
        'Seeding': SeedImg,
        'Social Event': SocialImg,
        'Wash and Pack': WashImg,
        'Weeding': WeedImg,
        'Other': OtherImg,
      },
      showAdd: false,
      customTaskName: '',
      selectedTasks: [],
      wage_at_moment: 0,
    };
    this.setDate = this.setDate.bind(this);
    this.changeDuration = this.changeDuration.bind(this);
    this.logClick = this.logClick.bind(this);
    this.assignImage = this.assignImage.bind(this);
    this.customTaskName = this.customTaskName.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }


  changeDuration(event){
    const regex = /^[0-9\b]+$/;
    const value = event.target.value;
    if (value === '' || regex.test(value)) {
      this.setState({ break_duration: value })
    }
  }

  customTaskName(event) {
    const value = event.target.value;
    this.setState({customTaskName: value});
  }

  componentDidMount() {
    this.props.dispatch(getTaskTypes());
    const selectedShift = this.props.selectedShift;
    let start_time = moment(selectedShift.start_time);
    let end_time = moment(selectedShift.end_time);
    let  valueGroups = {
        hours: 0,
        minutes: 0,
      };
    let tasks = selectedShift.tasks;
    let taskIDs = [];
    for(let task of tasks){
      if(!taskIDs.includes(task.task_id)){
        taskIDs.push(task.task_id);
      }
    }
    for(let id of taskIDs){
      this.logClick(id);
    }
    let break_duration = parseInt(selectedShift.break_duration, 10);

    valueGroups.hours = parseInt((break_duration/60).toFixed(0), 10);
    valueGroups.minutes = parseInt(break_duration % 60, 10);

    let new_start = moment(start_time).format('HH:mm');
    let new_end = moment(end_time).format('HH:mm');
    let wage_at_moment = selectedShift.wage_at_moment;

    this.setState({
      date: start_time,
      new_start,
      new_end,
      break_duration,
      wage_at_moment
    })
  }

  closeAddModal = () => {
    this.setState({showAdd: false});
  };

  openAddModal = () => {
    this.setState({showAdd: true});
  };

  logClick(task_id) {
    let div = document.getElementById(task_id);
    if (div.style.background === 'transparent' || div.style.background === '' || div.style.background === 'rgb(130, 207, 156)') {
      div.style.cssText = 'width: 80px; height: 80px; border-radius: 50px; margin: 0px auto; background: rgb(0, 117, 106); box-shadow: rgba(0, 0, 0, 0.08) 0px 2px 4px;';

      // add task to selected tasks
      if (!this.state.selectedTasks.includes(task_id)) {
        let selectedTasks = this.state.selectedTasks;
        selectedTasks.push(task_id);
        this.setState({selectedTasks: selectedTasks});

      }
    }
    else {
      div.style.cssText = 'width: 80px; height: 80px; border-radius: 50px; margin: 0px auto; background: rgb(130, 207, 156); box-shadow: rgba(0, 0, 0, 0.08) 0px 2px 4px;';

      // remove task from selected tasks
      if (this.state.selectedTasks.includes(task_id)) {
        let index = this.state.selectedTasks.indexOf(task_id);
        let selectedTasks = this.state.selectedTasks;
        selectedTasks.splice(index, 1);
        this.setState({selectedTasks: selectedTasks});
      }
    }
  }

  addCustomTask = () => {
    if (this.state.customTaskName !== '') {
      this.props.dispatch(addTaskType(this.state.customTaskName));
      this.closeAddModal();
    }
    else toastr.error('A task name is required');//alert('A task name is required');
  };


  assignImage(taskName) {
    if (this.state.defaultTaskNames.includes(taskName)) {
      return this.state.imgDict[taskName];
    }
    else return OtherImg;
  }


  nextPage() {
    let {new_start, new_end, date} = this.state;
    let newStartHourMin = new_start.split(':');
    let newEndHourMin = new_end.split(':');

    new_start = moment();
    new_end = moment();
    new_start = moment(new_start).set('year', moment(date).year());
    new_start = moment(new_start).set('month', moment(date).month());
    new_start = moment(new_start).set('date', moment(date).date());
    new_start = moment(new_start).set('hour', Number(newStartHourMin[0]));
    new_start = moment(new_start).set('minute', Number(newStartHourMin[1]));
    new_end = moment(new_end).set('year', moment(date).year());
    new_end = moment(new_end).set('month', moment(date).month());
    new_end = moment(new_end).set('date', moment(date).date());
    new_end = moment(new_end).set('hour', Number(newEndHourMin[0]));
    new_end = moment(new_end).set('minute', Number(newEndHourMin[1]));
    let beforeBreakDuration = moment
      .duration(moment(new_end)
        .diff(moment(new_start))
      ).asMinutes();

    if (beforeBreakDuration < 1) {
      toastr.error('Please enter a valid start-end duration');
      return;
    }

    const afterBreakDuration = beforeBreakDuration - this.state.break_duration;
    if (afterBreakDuration < 1) {
      toastr.error('Break duration > work duration 😂');
      return;
    }

    this.props.dispatch(setShiftDuration(afterBreakDuration));

    const preSelectedTasks = this.state.selectedTasks;
    if(preSelectedTasks.length < 1){
      toastr.error('Please select at least one task.');
      return;
    }
    let tasksToSet = [];
    const tasks = this.props.taskTypes;
    for (let task of tasks) {
      if (preSelectedTasks.includes(task.task_id)) {
        tasksToSet.push(task);
      }
    }

    this.props.dispatch(setSelectedTasks(tasksToSet));


    const startDateTime = moment(new_start).format();
    const endDateTime = moment(new_end).format();
    const startEndDateTime = {
      start: startDateTime,
      end: endDateTime,
      break: this.state.break_duration,
      wage_at_moment: this.state.wage_at_moment,
    };

    this.props.dispatch(setStartEndInState(startEndDateTime));

    history.push('/edit_shift_two');

  }

  changeWage = (e) => {
    this.setState({
      wage_at_moment: e.target.value,
    })
  };


  render() {
    const {
      new_start, new_end,
    } = this.state;
    const {taskTypes, farm, selectedShift} = this.props;
    const symbol = grabCurrencySymbol(farm);
    return (
      <div className={styles.logContainer} >
        <PageTitle backUrl="/my_shift" title="Edit Shift (Step 1)"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date" allowPast={true}/>
        <div className={styles.timeSection}>
          <div className={styles.timeRow}>
            <div className={styles.timeLabel}>
              Start Time
            </div>
            <div className={styles.timeSelector} >
              <input type="time" onChange={this.handleInputChange} name="new_start" value={new_start}/>
            </div>
          </div>

          <div className={styles.timeRow}>
            <div className={styles.timeLabel}>
              End Time
            </div>
            <div className={styles.timeSelector} >
              <input type="time" onChange={this.handleInputChange} name="new_end" value={new_end}/>
            </div>
          </div>

          <div className={styles.timeRow}>
            <div className={styles.timeLabel}>
              Break Duration
            </div>
            <div className={styles.timeInput}>
              <input type='number' name='break_duration' value={this.state.break_duration} onChange={this.changeDuration}/> <div className={styles.unit}>min</div>
            </div>
          </div>

          <div className={styles.wageContainer}>
            <div style={{width: '70%'}}>Wage for this shift ({symbol}/hr): </div>
            <div style={{width: '25%'}}><input type="number" defaultValue={Number(selectedShift.wage_at_moment)} onChange={(e) => this.changeWage(e)}/></div>
          </div>
        </div>
        <div className={styles.subTitle}>
         Theses are the tasks selected for this shift.
        </div>
        <Alert bsStyle="warning">
        The tasks selected for this shift are highlighted below. Deselecting a task will remove the task from this shift.
        </Alert>


        <Grid fluid={true} style={{marginLeft: 0, marginRight: 0, padding: '0 3%', marginTop: '5%', width: '100%'}}>
          <Row className="show-grid">
            {
              taskTypes && (
                taskTypes.map((type) => {
                  const taskName = type.task_name;
                  const buttonImg = this.assignImage(taskName);
                  return (
                    <Col xs={4} md={4} className={styles.col} onClick={() => this.logClick(type.task_id)}
                         key={type.task_id}>
                      <div className={styles.circleButton} id={type.task_id}>
                        <img src={buttonImg} alt=""/>
                      </div>
                      <div className={styles.buttonName}>
                        {taskName}
                      </div>
                    </Col>
                  )
                })
              )
            }
          </Row>
        </Grid>

        <div className={styles.buttonContainer}>
          <Button onClick={this.openAddModal}>Add Custom Task</Button>
        </div>

        <div className={styles.bottomContainer}>
          <div className={styles.cancelButton} onClick={() => history.push('/shift')}>
            Cancel
          </div>
          <button className='btn btn-primary' onClick={this.nextPage}>Next</button>
        </div>

        <Popup
          open={this.state.showAdd}
          closeOnDocumentClick
          onClose={this.closeAddModal}
          contentStyle={{display: 'flex', width: '100%', height: '100vh', padding: '0 5%'}}
          overlayStyle={{zIndex: '1060', height: '100vh'}}
        >
          <div className={styles.modal}>
            <div className={styles.popupTitle}>
              <a className={styles.close} onClick={this.closeAddModal}>
                <img src={closeButton} alt=""/>
              </a>
              <h3>Add a Task</h3>
            </div>
            <div className={styles.customContainer}>
              <div className={styles.taskTitle}>
                Name of the custom task
              </div>
              <div className={styles.taskInput}>
                <input type="text" maxLength="20" onChange={this.customTaskName}/>
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <Button onClick={this.addCustomTask}>Finish</Button>
            </div>

          </div>
        </Popup>

      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    taskTypes: taskTypeSelector(state),
    selectedShift: selectedShiftSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(EditShiftOne);

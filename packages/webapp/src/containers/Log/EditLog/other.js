import React, { Component } from "react";
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import {logSelector, currentLogSelector} from '../selectors';
import {fieldSelector, cropSelector} from '../../selector';
import DateContainer from '../../../components/Inputs/DateContainer';
import {actions, Form} from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import parseFields from "../Utility/parseFields";
import {editLog, deleteLog} from "../Utility/actions";
import parseCrops from "../Utility/parseCrops";
import ConfirmModal from "../../../components/Modals/Confirm";

class OtherLog extends Component{
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('logReducer.forms.otherLog'));

    this.state = {
      date: moment(),
      showModal: false,
    };
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { selectedLog, dispatch } = this.props;
    this.setState({
      date: selectedLog && moment.utc(selectedLog.date)
    });
    dispatch(actions.change('logReducer.forms.otherLog.notes', selectedLog.notes));
  }

  setDate(date){
    this.setState({
      date: date,
    });
  }

  handleSubmit(log) {
    const { dispatch, selectedLog, fields } = this.props;
    let selectedFields = parseFields(log, fields);
    let selectedCrops = parseCrops(log);
    let formValue = {
      activity_id: selectedLog.activity_id,
      activity_kind: 'other',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      notes: log.notes,
      user_id: localStorage.getItem('user_id'),
    };
    dispatch(editLog(formValue));
  }

  render(){
    const { crops, fields, selectedLog } = this.props;
    const selectedFields = selectedLog.field.map((f) => ({ value: f.field_id, label: f.field_name }));
    const selectedCrops = selectedLog.fieldCrop.map((fc) => ({ value: fc.field_crop_id, label: fc.crop.crop_common_name, field_id: fc.field_id }));

    return(
      <div className="page-container">
        <PageTitle backUrl="/log" title="Edit Other Log"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date"/>
        <Form model="logReducer.forms" className={styles.formContainer} onSubmit={(val) => this.handleSubmit(val.otherLog)}>
          <DefaultLogForm
            selectedCrops={selectedCrops}
            selectedFields={selectedFields}
            parent='logReducer.forms'
            model=".otherLog"
            fields={fields}
            crops={crops}
            notesField={true}
          />
          <LogFooter edit={true} onClick={() => this.setState({ showModal: true })}/>
        </Form>
        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => this.props.dispatch(deleteLog(selectedLog.activity_id))}
          message='Are you sure you want to delete this log?'
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    fields: fieldSelector(state),
    logs: logSelector(state),
    selectedLog: currentLogSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(OtherLog);

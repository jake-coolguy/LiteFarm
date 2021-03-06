import React from 'react';
import { connect } from 'react-redux';
import { Control, Errors, Form } from 'react-redux-form';
import axios from 'axios';
import { toastr } from 'react-redux-toastr';

import styles from './styles.scss';
import apiConfig from '../../apiConfig';
import Auth from '../../Auth/Auth';

const auth = new Auth();
const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);

const signUpFields = [
  {
    key: 'email',
    type: 'text',
    label: 'Email',
    isEditable: false,
    validators: {
      required: (val) => val.length,
      validEmail: (val) => validEmailRegex.test(val),
    },
    errorMessages: {
      required: 'Email cannot be empty',
      validEmail: 'Email must be valid',
    },
  },
  {
    key: 'first_name',
    type: 'text',
    label: 'First Name',
    isEditable: true,
    validators: {
      required: (val) => val.length,
    },
    errorMessages: {
      required: 'First name cannot be empty',
    },
  },
  {
    key: 'last_name',
    type: 'text',
    label: 'Last Name',
    isEditable: true,
    validators: {
      required: (val) => val.length,
    },
    errorMessages: {
      required: 'Last name cannot be empty',
    },
  },
  {
    key: 'password',
    type: 'password',
    label: 'Password',
    isEditable: true,
    validators: {
      length: (val) => val.length >= 8,
      upperCase: (val) => RegExp(/(?=.*[A-Z])/).test(val),
      digit: (val) => RegExp(/(?=.*\d)/).test(val),
      symbol: (val) => RegExp(/(?=.*\W)/).test(val),
    },
    errorMessages: {
      length: 'at least 8 characters',
      upperCase: 'at least one upper case character',
      digit: 'at least one number',
      symbol: 'at least one special character',
    },
  }
];

class SignUp extends React.Component {
  constructor(props) {
    super(props);
    const { match } = props;
    const { params } = match;
    const {
      token,
      user_id,
      farm_id,
      email,
      first_name,
      last_name,
    } = params;

    this.state = {
      isTokenValid: true,
      token,
      user_id,
      farm_id,
      email,
      first_name,
      last_name,
    };
  }

  async componentDidMount() {
    // Make API call to verify token and set isTokenValid's state accordingly
    const { signUpUrl } = apiConfig;
    const { token } = this.state;
    try {
      const header = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const result = await axios.get(signUpUrl + `/verify_token/${token}`, header);
      if (result && result.status === 200) {
        this.setState({ isTokenValid: true });
      }
    } catch (error) {
      this.setState({ isTokenValid: false });
      if (error.response) {
        toastr.error(error.response.data);
      } else {
        toastr.error('Token verification failed');
      }
    }
  }

  onClickSubmit = async (form) => {
    const { signUpUrl } = apiConfig;
    const {
      token,
      user_id,
      farm_id,
    } = this.state;
    const {
      first_name,
      last_name,
      password,
    } = form;

    const user = {
      token,
      farm_id,
      first_name,
      last_name,
      password,
    };

    const header = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const result = await axios.patch(signUpUrl + `/${user_id}`, user, header);
      if (result && result.status === 200) {
        toastr.success(result.data);
        auth.login();
        this.setState({ isTokenValid: false });
      }
    } catch (error) {
      if (error.response) {
        toastr.error(error.response.data);
      } else {
        toastr.error('Failed to sign up');
      }
    }
  }

  isDisabled = () => {
    const { profileForms } = this.props;
    const { signUpInfo } = profileForms;
    // If at least one field has errors, return true
    return Object.keys(signUpInfo).some(key => {
      const target = signUpFields.find(field => field.key === key);
      const { validators } = target;
      const textFieldValue = signUpInfo[key];
      return Object.keys(validators).some(validator => !validators[validator](textFieldValue));
    });
  }

  renderErrorComponent = (controlledTextComponent) => {
    const { profileForms } = this.props;
    const { signUpInfo } = profileForms;
    const { password } = signUpInfo;
    const { key, validators, errorMessages } = controlledTextComponent;
    if (key === 'password') {
      // Custom error component that doesn't hide error messages when errorless
      return (
        <div className={styles.criteriaContainer}>
          {
            Object.keys(validators).map(criterion => {
              const isCriterionSatisfied = validators[criterion](password);
              const statusIconStyle = isCriterionSatisfied
                ? styles.satisfiedIcon
                : styles.unsatisfiedIcon;
              const statusIcon = isCriterionSatisfied ? 'done' : 'close';
              const criterionTextStyle = isCriterionSatisfied
                ? styles.satsifiedText
                : styles.unsatisfiedText;
              return (
                <div key={criterion} className={styles.criterionContainer}>
                  <i className={`material-icons ${statusIconStyle}`}>
                    {statusIcon}
                  </i>
                  <div className={criterionTextStyle}>
                    {errorMessages[criterion]}
                  </div>
                </div>
              );
            })
          }
        </div>
      );
    }

    return (
      <Errors
        model={`.signUpInfo.${key}`}
        messages={errorMessages}
        show={field => (field.touched && !field.focus)}
        component={(props) => (
          <div className={styles.errorContainer}>
            <i className="material-icons">error_outline</i>
            <div className={styles.errorText}>{props.children}</div>
          </div>
        )}
      />
    );
  }

  render() {
    const { isTokenValid } = this.state;

    if (!isTokenValid) {
      return (
        <div className={styles.home}>
          <div className={styles.titleContainer}>
            <h3>Invalid Token</h3>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.home}>
        <div className={styles.titleContainer}>
          <h3>Sign Up</h3>
        </div>
        <Form
          model="profileForms"
          onSubmit={(val) => this.onClickSubmit(val.signUpInfo)}
          className={styles.formContainer}
        >
          {
            signUpFields.map(field => {
              const { key, label, type, validators, isEditable } = field;
              return (
                <div key={key}>
                  <div className={styles.inputContainer}>
                    <label>{label}</label>
                    <Control.text
                      type={type}
                      model={`.signUpInfo.${key}`}
                      validators={validators}
                      defaultValue={this.state[key] || ''}
                      disabled={!isEditable}
                    />
                  </div>
                  { this.renderErrorComponent(field) }
                </div>
              );
            })
          }
          <button
            type="submit"
            className={styles.signUpButton}
            disabled={this.isDisabled()}
          >
            Sign Up
          </button>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    profileForms: state.profileForms,
  }
};

export default connect(mapStateToProps)(SignUp);

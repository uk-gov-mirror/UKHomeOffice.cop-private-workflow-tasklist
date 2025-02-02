import React from 'react';

import moment from 'moment'
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import _ from 'lodash';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {Details, Accordion} from 'govuk-frontend';
import FormDetailsPanel from "./FormDetailsPanel";
import {getFormVersion, setSelectedFormReference, setProcessStartSort} from "../actions";
import {processStartSort, selectedFormReference} from "../selectors";
import withLog from "../../../core/error/component/withLog";
import CaseActions from "../case-actions/components/CaseActions";
import CaseMetrics from "./CaseMetrics";
import CaseAttachments from "./CaseAttachments";

class CaseDetailsPanel extends React.Component {
    constructor(props) {
        super(props);
        this.groupForms = this.groupForms.bind(this);
        this.state = {
            caseReferenceUrl: `${window.location.origin}/cases/${this.props.caseDetails.businessKey}`,
            caseReferenceUrlCopied: false
        }
    }

    componentDidMount() {
        document.querySelectorAll('[data-module="govuk-details"]')
            .forEach(element => {
                new Details(element).init()
            });
        new Accordion(document.getElementById(`caseDetails-${this.props.caseDetails.businessKey}`)).init();
        this.clearAccordionStorage();
    }

    clearAccordionStorage() {
        _.forIn(window.sessionStorage, (value, key) => {
            if (_.startsWith(key, 'caseDetails-') === true) {
                window.sessionStorage.removeItem(key);
            }
        });
    }

    componentWillUnmount() {
        this.clearAccordionStorage()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    groupForms = formReferences => {
        return _.mapValues(_.groupBy(formReferences, "title"), v => _.orderBy(v, d => {
            return moment(d.submissionDate)
        }, ['desc']));
    };

    render() {
        const {caseDetails, selectedFormReference, processStartSort} = this.props;

        return (
          <div id="case">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full govuk-card">
                <div className="govuk-grid-row">
                  <div className="govuk-grid-column-one-half">
                    <h2 className="govuk-heading-m">{caseDetails.businessKey}</h2>
                  </div>
                  <div className="govuk-grid-column-one-half">
                    <CopyToClipboard
                      text={this.state.caseReferenceUrl}
                      onCopy={() => this.setState({caseReferenceUrlCopied: true})}
                    >
                      <button style={{float: 'right'}} className="govuk-button govuk-button--secondary">
                        {this.state.caseReferenceUrlCopied ? 'Copied case link' : 'Copy case link'}
                      </button>
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
            </div>
            {caseDetails.actions && caseDetails.actions.length > 0 ?
              <CaseActions {...{caseDetails}} />
                 : null}
            <div className="govuk-grid-row govuk-card govuk-!-margin-top-4">
              <div className="govuk-grid-column-full">
                <h3 className="govuk-heading-m">Case history</h3>
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="sort">
                                    Order by
                  </label>
                  <select
                    className="govuk-select"
                    id="sort"
                    name="sort"
                    onChange={e => {
                                    this.props.setProcessStartSort(e.target.value)
                                }}
                    defaultValue={processStartSort}
                  >
                    <option value="desc">Latest process start date</option>
                    <option value="acs">Earliest process start date</option>
                  </select>
                </div>
                <div
                  id={`caseDetails-${caseDetails.businessKey}`}
                  className="govuk-accordion"
                  data-module="govuk-accordion"
                >
                  {caseDetails.processInstances.map(processInstance => {
                                    const groupedForms = this.groupForms(processInstance.formReferences);
                                    return (
                                      <div className="govuk-accordion__section" key={processInstance.id}>
                                        <div className="govuk-accordion__section-header">
                                          <h4 className="govuk-accordion__section-heading">
                                            <span
                                              className="govuk-accordion__section-button"
                                              id={`heading-${processInstance.id}`}
                                            >
                                              {processInstance.name}
                                            </span>
                                          </h4>
                                        </div>
                                        <div
                                          id={`accordion-with-summary-sections-content-${processInstance.id}`}
                                          className="govuk-accordion__section-content"
                                          aria-labelledby={`accordion-with-summary-sections-heading-${processInstance.id}`}
                                        >

                                          <div className="govuk-grid-row govuk-!-margin-bottom-2">
                                            <div className="govuk-grid-column-full">
                                              <div className="govuk-grid-row">
                                                <div className="govuk-grid-column-one-half">
                                                  <span className="govuk-caption-m">Status</span>
                                                  <h3 className="govuk-heading-s"><span
                                                    className="govuk-tag"
                                                  >{processInstance.endDate ? 'Completed' : 'Active'}
                                                                                  </span>
                                                  </h3>
                                                </div>
                                                <div className="govuk-grid-column-one-half">
                                                  <span className="govuk-caption-m">Forms</span>
                                                  <h3 className="govuk-heading-s">{Object.keys(groupedForms).length} completed</h3>

                                                </div>
                                                <div className="govuk-grid-column-one-half">
                                                  <span className="govuk-caption-m">Start date</span>
                                                  <h3 className="govuk-heading-s">{moment.utc(processInstance.startDate).local().format('DD/MM/YYYY HH:mm')}</h3>
                                                </div>
                                                <div className="govuk-grid-column-one-half">
                                                  <span className="govuk-caption-m">End date</span>

                                                  <h3 className="govuk-heading-s">
                                                    {processInstance.endDate ? moment.utc(processInstance.endDate).local().format('DD/MM/YYYY HH:mm') :
                                                                    'Active'}
                                                  </h3>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          {processInstance.formReferences && processInstance.formReferences.length !== 0 ? (
                                            <React.Fragment>
                                              {Object.keys(groupedForms).map((formName, index) => {
                                                        const forms = groupedForms[formName];
                                                        return (
                                                          <React.Fragment key={formName}>
                                                            <details
                                                              className="govuk-details"
                                                              data-module="govuk-details"
                                                            >
                                                              <summary className="govuk-details__summary">
                                                                <span className="govuk-details__summary-text">
                                                                  {formName}
                                                                </span>
                                                              </summary>
                                                              <div>
                                                                {forms.map((form, index) => {
                                                                        const formVersionId = form.versionId;
                                                                        const key = `${formVersionId}-${form.submissionDate}`;
                                                                        const selectedVersionAndKey = selectedFormReference &&
                                                                            `${selectedFormReference.versionId}-${selectedFormReference.submissionDate}` === key;
                                                                        return (
                                                                          <dl
                                                                            key={key}
                                                                            className="govuk-summary-list govuk-summary-list--no-border"
                                                                          >
                                                                            <div className="govuk-summary-list__row">
                                                                              <dt className="govuk-summary-list__key">
                                                                                    Submitted by
                                                                              </dt>
                                                                              <dd className="govuk-summary-list__value">
                                                                                {form.submittedBy}
                                                                              </dd>
                                                                            </div>
                                                                            <div className="govuk-summary-list__row">
                                                                              <dt className="govuk-summary-list__key">
                                                                                    Submitted on
                                                                              </dt>
                                                                              <dd className="govuk-summary-list__value">
                                                                                {moment(form.submissionDate).format('DD/MM/YYYY HH:mm')}
                                                                              </dd>
                                                                            </div>

                                                                            <div className="govuk-summary-list__row">
                                                                              <dt className="govuk-summary-list__key">
                                                                                {index === 0 ? (
                                                                                  <span
                                                                                    className="govuk-tag"
                                                                                  >Latest
                                                                                  </span>
) : null}
                                                                              </dt>
                                                                              <dd className="govuk-summary-list__value">
                                                                                <a
                                                                                  href="#"
                                                                                  onClick={event => {
                                                                                        event.preventDefault();
                                                                                        const keyFromSelectedReference = selectedFormReference ?
                                                                                            `${selectedFormReference.versionId}-${selectedFormReference.submissionDate}` : null;

                                                                                        if ((!selectedFormReference || (keyFromSelectedReference && keyFromSelectedReference !== key))) {
                                                                                            this.props.setSelectedFormReference(form)
                                                                                        } else {
                                                                                            this.props.setSelectedFormReference(null)
                                                                                        }

                                                                                    }}
                                                                                  role="button"
                                                                                  draggable="false"
                                                                                  className="govuk-button"
                                                                                  data-module="govuk-button"
                                                                                >
                                                                                  {selectedVersionAndKey ? `Hide details` : `Show details`}
                                                                                </a>
                                                                                <div>
                                                                                  {selectedVersionAndKey ? (
                                                                                    <FormDetailsPanel
                                                                                      key={key}
                                                                                      {...{
                                                                                                    formReference: this.props.selectedFormReference,
                                                                                                    businessKey: caseDetails.businessKey
                                                                                                }}
                                                                                    />
                                                                                          ) : null}
                                                                                </div>
                                                                              </dd>
                                                                            </div>

                                                                          </dl>
)
                                                                    })}
                                                              </div>
                                                            </details>
                                                            {(Object.keys(groupedForms).length - 1) !== index ? (
                                                              <hr style={{
                                                                    borderBottom: '2px solid #1d70b8',
                                                                    borderTop: 'none'
                                                                }}
                                                              />
                                                              ) : null}
                                                          </React.Fragment>
)
                                                    })}
                                            </React.Fragment>
                                              ) :
                                            <h4 className="govuk-heading-s">No forms available</h4>}

                                        </div>

                                      </div>
)
                                })}
                </div>
              </div>
            </div>
            <CaseAttachments businessKey={caseDetails.businessKey} />
            {caseDetails.metrics ? <CaseMetrics {...{caseDetails}} /> : null}

          </div>
)
            }
            }

            CaseDetailsPanel.propTypes = {
            processStartSort: PropTypes.string,
            setProcessStartSort: PropTypes.func,
            setSelectedFormReference: PropTypes.func.isRequired,
            selectedFormReference: PropTypes.object
        };

            const mapDispatchToProps = dispatch => bindActionCreators({
            getFormVersion,
            setSelectedFormReference,
            setProcessStartSort
        }, dispatch);

            export default withRouter(connect(state => {
            return {
            kc: state.keycloak,
            appConfig: state.appConfig,
            selectedFormReference: selectedFormReference(state),
            processStartSort: processStartSort(state)
        }
        }, mapDispatchToProps)(withLog(CaseDetailsPanel)));


import * as types from "./actionTypes";

const fetchTaskForm = (formName) => ({
    type: types.FETCH_TASK_FORM,
    formName
});


const fetchTaskFormSuccess = payload => ({
    type: types.FETCH_TASK_FORM_SUCCESS,
    payload
});

const fetchTaskFormFailure = () => ({
    type: types.FETCH_TASK_FROM_FAILURE
});

export {
    fetchTaskForm,
    fetchTaskFormSuccess,
    fetchTaskFormFailure
}
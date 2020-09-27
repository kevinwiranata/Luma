import Api from '@/services/api'

export default {
  queryAll() {
    return Api().get('queryAll')
  },
  queryByObjectType() {
    return Api().get('queryByObjectType')
  },
  queryWithQueryString(selected) {
    return Api().post('queryWithQueryString', {
      selected: selected
    }) 
  },
  registerPatient(patientID, password, fullName) {
    return Api().post('registerPatient', {
      patientID: patientID,
      password: password,
      fullName: fullName
      
    }) 
  },
  registerDoctor(doctorID, password, fullName) {
    return Api().post('registerDoctor', {
      doctorID: doctorID,
      password: password,
      fullName: fullName
      
    }) 
  },
  validatePatient(patientID) {
    return Api().post('validatePatient', {
      patientID: patientID
    }) 
  },
  queryByKey(key) {
    return Api().post('queryByKey', {
      key: key
    }) 
  },
  getCurrentStanding() {
    return Api().get('getCurrentStanding')
  }
}``
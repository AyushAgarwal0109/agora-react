import axios from 'axios';

export const getAccessToken = async () => {
  var data = JSON.stringify({
    appointment_id: '620e21b47f048f02284c63be',
  });

  var config = {
    method: 'post',
    url: 'http://withdocs1.herokuapp.com/api/v11/user/meetingtoken',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWVkNDA3Mzk4NWE1MDQyOWM0NWI4MjkiLCJyb2xlIjoicGF0aWVudCIsImlhdCI6MTY1NzM3NTk5NCwiZXhwIjoxNjU3NDYyMzk0fQ.sPVcgXCaE-4tan4CyigkVDZBNVBDxxVKVIG7lIBysqk',
      'Content-Type': 'application/json',
    },
    data: data,
  };

  return await axios(config)
    .then(function (response) {
      console.log(response);
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
};

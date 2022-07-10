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
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWVkNDA3Mzk4NWE1MDQyOWM0NWI4MjkiLCJyb2xlIjoicGF0aWVudCIsImlhdCI6MTY1NzQ2NzE0MCwiZXhwIjoxNjU3NTUzNTQwfQ.Rs-DaiNyDX-Q1AGjsjlmTgUmHUOTt0XnLvUPx6NbnrQ',
      'Content-Type': 'application/json',
    },
    data: data,
  };

  return await axios(config)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
};

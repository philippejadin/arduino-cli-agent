/*
Sample code to use arduino-cli-agent with jquery / ajax
Check the related uploader_ajax.html file for tha markup.
*/

$(document).ready(function() {
  $("#detect_button").click(function() {

    $('#detect_button').text('Searching...');
    $.ajax({
        url: 'http://127.0.0.1:8080/connectedboards',
      })
      .then(
        function success(data) {
          console.log(data)
          if (data['count'] == 0) {
            $('#detect_button').text('No board found, click to retry')
          } else {
            $('#detect_button').text(data['count'] + ' board found')

            $('#fqbn option').remove()
            $('#ports option').remove()

            data.boards.forEach(function(board) {
              $('#fqbn').append('<option value="' + board.fqbn + '">' + board.name + '</option>').change()
              $('#port').append('<option value="' + board.port + '">' + board.port + '</option>').change()
            });
          }

        },

        function fail(data, status) {
          alert('Error ' + status)
          console.log(status);
        }
      );
  })
})


$(document).ready(function() {
  $("#flash_button").click(function() {

    $('#flash_button').text('Wait...')
    $.ajax({
        url: 'http://127.0.0.1:8080/compile',
        method: 'post',
        data: {
          fqbn: $("#fqbn").val(),
          port: $("#port").val(),
          code: $("#code").val(),
          filename: $("#filename").val()
        }

      })
      .then(
        function success(data) {
          console.log(data)
          if (data.error) {
            $('#flash_button').text('Failed!')
            setTimeout(function() {
              $('#flash_button').text('Upload to arduino')
            }, 2000);
            alert(data.details)

          } else {
            $('#flash_button').text('Success!')
            setTimeout(function() {
              $('#flash_button').text('Upload to arduino')
            }, 2000);
          }
        },
        function fail(data, status) {
          $('#flash_button').text('Failed!')
          alert('Error ' + status)
          console.error(data);
        }
      )
  })
})

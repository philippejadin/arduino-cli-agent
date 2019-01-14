/*
Sample code to use arduino-cli-agent with jquery / ajax
Check the related uploader_ajax.html file for tha markup.
*/

$(document).ready(function() {
  $("#uploader_list").click(function() {

    $('#uploader_list').text('Searching...');
    $.ajax({
        url: 'http://127.0.0.1:8080/connectedboards',
      })
      .then(
        function success(data) {
          console.log(data)
          if (data['count'] == 0) {
            $('#uploader_list').text('No board found, click to retry')
          } else {
            $('#uploader_list').text(data['count'] + ' board found')

            $('#fqbn option').remove()
            $('#ports option').remove()

            data.boards.forEach(function(board) {
              $('#uploader_boards').append('<option value="' + board.fqbn + '">' + board.name + '</option>').change()
              $('#uploader_ports').append('<option value="' + board.port + '">' + board.port + '</option>').change()
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
  $("#uploader_flash").click(function() {

    $('#uploader_flash').text('Wait...')
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
            $('#uploader_flash').text('Failed!')
            setTimeout(function() {
              $('#uploader_flash').text('Upload to arduino')
            }, 2000);
            alert(data.details)

          } else {
            $('#uploader_flash').text('Success!')
            setTimeout(function() {
              $('#uploader_flash').text('Upload to arduino')
            }, 2000);
          }
        },
        function fail(data, status) {
          $('#uploader_flash').text('Failed!')
          alert('Error ' + status)
          console.error(data);
        }
      )
  })
})

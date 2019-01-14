$(document).ready(function() {
  $("#uploader_list").click(function() {

    $('#uploader_list').text('Searching...');
    $.ajax({
        url: 'http://127.0.0.1:8080/connectedboards',
        /*
        data: {
          id: 'some-unique-id'
        }
        */
      })
      .then(
        function success(data) {
          console.log(data)
          if (data['count'] == 0) {
            $('#uploader_list').text('No board found, click to retry')
          } else {
            $('#uploader_list').text(data['count'] + ' board found')


            data.boards.forEach(function(board) {
              $('#uploader_boards').prepend('<option name="' + board.package + '">' + board.name + '</option>').change()
              $('#uploader_ports').prepend('<option name="' + board.port + '">' + board.port + '</option>').change()
            });
            $('#uploader_boards:first-child').prop('selected', true).change();
            $('#uploader_ports:first-child').prop('selected', true).change();

          }

        },

        function fail(data, status) {
          alert('Error ' + status)
          console.log(status);
        }
      );
  })
})

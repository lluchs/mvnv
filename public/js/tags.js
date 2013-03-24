/* Handles the select2 tagging */

$(function() {
  // Get list of tags.
  var tags = $('datalist#tags > option').map(function() { return $(this).val() }).get();
  if (tags.length) {
    // Convert all tag fields to select2 boxes.
    $('input[list=tags]').select2({
      width: 'off',
      tags: tags,
      tokenSeparators: [',']
    });
  }
});


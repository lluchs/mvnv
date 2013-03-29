/* Delete confirmation */
jQuery.fn.confirm = function() {
  return this.one('click.confirm', function(event) {
    event.preventDefault();
    var timeoutToken;
    var $this = $(this);
    var originalText = $this.html();
    $this.html('<i class="icon-remove"></i> Wirklich löschen?').addClass('btn-danger').on('mouseout.confirm', function() {
      timeoutToken = setTimeout(function() {
        $this.html(originalText).off('.confirm').removeClass('btn-danger').confirm();
      }, 3 * 1000);
    }).on('mouseover.confirm', function() {
      clearTimeout(timeoutToken);
    });
  }).removeClass('btn-danger');
};

$(function() {
  $('.delete-form button').confirm();
});

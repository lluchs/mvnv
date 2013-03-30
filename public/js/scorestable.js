/* Sortable scores table */

$(function() {
  table = $('table.scores')
  table.stupidtable({
    // IDs might be empty, which parses to NaN.
    id: function(a, b) {
      a = parseInt(a, 10);
      b = parseInt(b, 10);
      if (isNaN(a)) {
        if (isNaN(b))
          return 0;
        return -1;
      }
      else if (isNaN(b)) {
        return 1;
      }
      // Neither a nor b are NaN.
      return a - b;
    }
  });
  table.on("aftertablesort", function(event, data) {
    var th = $(this).find("th");
    th.find(".arrow").remove();
    var dir = $.fn.stupidtable.dir;

    var arrow = data.direction === dir.ASC ? "&uarr;" : "&darr;";
    th.eq(data.column).append('<span class="arrow">' + arrow +'</span>');
  });
});

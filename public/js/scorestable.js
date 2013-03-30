/* Sortable scores table */

$(function() {
  $('table.scores').stupidtable({
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
});

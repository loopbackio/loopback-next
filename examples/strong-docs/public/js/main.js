$(document).ready(function () {
  // Switch from empty anchors to id-ed headings
  $('a[name]').get().forEach(function (i) {
    var $i = $(i);

    $i.next().attr('id', $i.attr('name'));
    $i.detach();
  });


  $('.scroll-spy-target').on('activate.bs.scrollspy', function (event) {
    var $this = $(this);
    var $target = $(event.target);

    $this.scrollTo($target, 0, {
      offset: -($this.innerHeight() / 2)
    });
  });
});

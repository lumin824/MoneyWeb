var $parentNode = window.parent.document;

function $childNode(name) {
    return window.frames[name]
}

// tooltips
$('.tooltip-demo').tooltip({
    selector: "[data-toggle=tooltip]",
    container: "body"
});

// 使用animation.css修改Bootstrap Modal
$('.modal').appendTo("body");

$("[data-toggle=popover]").popover();

//折叠ibox
$('.collapse-link').click(function () {
    var ibox = $(this).closest('div.ibox');
    var button = $(this).find('i');
    var content = ibox.find('div.ibox-content');
    content.slideToggle(200);
    button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
    ibox.toggleClass('').toggleClass('border-bottom');
    setTimeout(function () {
        ibox.resize();
        ibox.find('[id^=map-]').resize();
    }, 50);
});

//关闭ibox
$('.close-link').click(function () {
    var content = $(this).closest('div.ibox');
    content.remove();
});

//判断当前页面是否在iframe中
if (top == this) {
    var gohome = '<div class="gohome"><a class="animated bounceInUp" href="index.html?v=4.0" title="返回首页"><i class="fa fa-home"></i></a></div>';
    $('body').append(gohome);
}

//animation.css
function animationHover(element, animation) {
    element = $(element);
    element.hover(
        function () {
            element.addClass('animated ' + animation);
        },
        function () {
            //动画完成之前移除class
            window.setTimeout(function () {
                element.removeClass('animated ' + animation);
            }, 2000);
        });
}

//拖动面板
function WinMove() {
    var element = "[class*=col]";
    var handle = ".ibox-title";
    var connect = "[class*=col]";
    $(element).sortable({
            handle: handle,
            connectWith: connect,
            tolerance: 'pointer',
            forcePlaceholderSize: true,
            opacity: 0.8,
        })
        .disableSelection();
};


$(function(){
  //计算元素集合的总宽度
  function calSumWidth(elements) {
      var width = 0;
      $(elements).each(function () {
          width += $(this).outerWidth(true);
      });
      return width;
  }
  //滚动到指定选项卡
  function scrollToTab(element) {
      var marginLeftVal = calSumWidth($(element).prevAll()), marginRightVal = calSumWidth($(element).nextAll());
      // 可视区域非tab宽度
      var tabOuterWidth = calSumWidth($(".content-tabs", parent.document).children().not(".J_menuTabs"));
      //可视区域tab宽度
      var visibleWidth = $(".content-tabs", parent.document).outerWidth(true) - tabOuterWidth;
      //实际滚动宽度
      var scrollVal = 0;
      if ($(".page-tabs-content", parent.document).outerWidth() < visibleWidth) {
          scrollVal = 0;
      } else if (marginRightVal <= (visibleWidth - $(element).outerWidth(true) - $(element).next().outerWidth(true))) {
          if ((visibleWidth - $(element).next().outerWidth(true)) > marginRightVal) {
              scrollVal = marginLeftVal;
              var tabElement = element;
              while ((scrollVal - $(tabElement).outerWidth()) > ($(".page-tabs-content").outerWidth() - visibleWidth)) {
                  scrollVal -= $(tabElement).prev().outerWidth();
                  tabElement = $(tabElement).prev();
              }
          }
      } else if (marginLeftVal > (visibleWidth - $(element).outerWidth(true) - $(element).prev().outerWidth(true))) {
          scrollVal = marginLeftVal - $(element).prev().outerWidth(true);
      }
      $('.page-tabs-content',parent.document).animate({
          marginLeft: 0 - scrollVal + 'px'
      }, "fast");
  }

  $(".J_openTab").each(function (index) {
      if (!$(this).attr('data-index')) {
          $(this).attr('data-index', index);
      }
  });

  function openTab() {
      // 获取标识数据
      var dataUrl = $(this).attr('href'),
          dataIndex = $(this).data('index'),
          menuName = $.trim($(this).text()),
          flag = true;
      if (dataUrl == undefined || $.trim(dataUrl).length == 0)return false;

      // 选项卡菜单已存在
      $('.J_menuTab', parent.document).each(function () {
          if ($(this).data('id') == dataUrl) {
              if (!$(this).hasClass('active')) {
                  $(this).addClass('active').siblings('.J_menuTab').removeClass('active');
                  scrollToTab(this);
                  // 显示tab对应的内容区
                  $('.J_mainContent .J_iframe', parent.document).each(function () {
                      if ($(this).data('id') == dataUrl) {
                          $(this).show().siblings('.J_iframe').hide();
                          return false;
                      }
                  });
              }
              flag = false;
              return false;
          }
      });

      // 选项卡菜单不存在
      if (flag) {
          var str = '<a href="javascript:;" class="active J_menuTab" data-id="' + dataUrl + '">' + menuName + ' <i class="fa fa-times-circle"></i></a>';
          $('.J_menuTab',parent.document).removeClass('active');

          // 添加选项卡对应的iframe
          var str1 = '<iframe class="J_iframe" name="iframe' + dataIndex + '" width="100%" height="100%" src="' + dataUrl + '" frameborder="0" data-id="' + dataUrl + '" seamless></iframe>';
          $('.J_mainContent', parent.document).find('iframe.J_iframe').hide().parents('.J_mainContent').append(str1);

          //显示loading提示
  //            var loading = layer.load();
  //
  //            $('.J_mainContent iframe:visible').load(function () {
  //                //iframe加载完成后隐藏loading提示
  //                layer.close(loading);
  //            });
          // 添加选项卡
          $('.J_menuTabs .page-tabs-content', parent.document).append(str);
          scrollToTab($('.J_menuTab.active', parent.document));
      }
      return false;
  }

  $('body').on('click', '.J_openTab', openTab);
})

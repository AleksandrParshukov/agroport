function init_menu() {
  const $js_header_menu_toggle = $('.js_header_menu_toggle'),
    $main_nav = $('.mob-nav');

  $js_header_menu_toggle.on('click', function () {
    disable_toggle();

    if ($main_nav.is('.open')) {
      $main_nav.removeClass('open');
      $('html').removeClass('modal-open');
    } else {
      $main_nav.addClass('open');
      $('html').addClass('modal-open');
    }

    $main_nav.on('click', function document_click_handler(evt) {
      if (!$(evt.target).is('.mob-nav__content') && !$(evt.target).closest('.mob-nav__content').length) {
        $main_nav.removeClass('open');
        $('html').removeClass('modal-open');
        $(document).off('click', document_click_handler);
      }
    });

    function disable_toggle() {
      $js_header_menu_toggle.addClass('disabled');

      setTimeout(() => {
        $js_header_menu_toggle.removeClass('disabled');
      }, 600);
    }
  });
}

function init_modals() {
  $.fn.modal = function (action) {
    return this.each(function () {
      var $modal = $(this);

      function show_modal() {
        $modal.fadeIn(0, function () {
          $modal.addClass('show');
        });
        $('body').addClass('modal_open'); // можно потом использовать для блокировки скролла
      }

      function hide_modal() {
        $modal.removeClass('show');
        setTimeout(function () {
          $modal.fadeOut(0);
          $('body').removeClass('modal_open');
        }, 300);
      }

      if (action === 'show') {
        show_modal();
      } else if (action === 'hide') {
        hide_modal();
      }

      // Поддержка кликов на кнопки и фон
      if (!$modal.data('modal_initialized')) {
        $modal.on('click', function (e) {
          if ($(e.target).is('.modal')) hide_modal();
        });
        $modal.on('click', '[data-dismiss="modal"]', hide_modal);
        $modal.data('modal_initialized', true);
      }
    });
  };

  $(document).on('click', '[data-dismiss="modal"]', function () {
    var $modal = $(this).closest('.modal');
    $modal.modal('hide');
  });

  // Открытие через data-атрибуты (bootstrap-стиль)
  $(document).on('click', '[data-toggle="modal"]', function (evt) {
    evt.preventDefault();
    var target = $(this).data('target');
    $(target).modal('show');
  });

  // Закрытие по Esc
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      $('.modal.show').each(function () {
        $(this).modal('hide');
      });
    }
  });
}

function init_custom_select() {
  const $select = $('.custom-select');

  if (!$select.length) {
    return false;
  }

  const $selected = $select.find('.custom-select__selected'),
    $options = $select.find('.custom-select__options'),
    $option = $options.find('.custom-select__option'),
    $hiddenInput = $select.find('input[type="hidden"]');

  $selected.on('click', function () {
    if ($options.is(':visible')) {
      $options.slideUp(300);
      $select.removeClass('open');
    } else {
      $options.slideDown(300);
      $select.addClass('open');

      $(document).on('click', function doc_click_handler(e) {
        if (!$(e.target).closest($select).length) {
          $options.slideUp(300);
          $select.removeClass('open');
          $(document).off('click', doc_click_handler);
        }
      });
    }
  });

  $option.on('click', function () {
    $selected.find('span').text($(this).text());
    $hiddenInput.val($(this).data('value'));
    $options.slideUp(300);
    $select.removeClass('open');
  });
}

function init_tabs() {
  const $all_tabs = $('.js_tabs');

  if (!$all_tabs.length) {
    return false;
  }

  $all_tabs.each(function () {
    const $tabs = $(this),
      $links = get_links($tabs),
      $panels = get_panels($tabs);

    $links.on('click', function (evt) {
      evt.preventDefault();
      const target_id = $(this).attr('href'),
        $cur_tabs = $(this).closest('.js_tabs'),
        $links = get_links($cur_tabs),
        $panels = get_panels($cur_tabs);

      $links.removeClass('active');
      $(this).addClass('active');

      $panels.hide();
      $(target_id).stop(true, true).fadeIn(150);
    });

    // Активируем первую вкладку при инициализации
    $links.first().addClass('active');
    $panels.hide().first().show();

    function get_links($tb) {
      const $nav = $tb.find('.js_tabs_nav').filter(function () {
        return $(this).closest('.js_tabs').is($tb);
      });

      return $nav.find('a');
    }

    function get_panels($tb) {
      const $content = $tb.find('.js_tabs_content').filter(function () {
        return $(this).closest('.js_tabs').is($tb);
      });

      return $content.children('div');
    }
  });
}

function init_form_tabs() {
  const $form_tabs = $('.js_form_tabs');

  if (!$form_tabs.length) {
    return false;
  }

  const $prev = $form_tabs.find('.js_form_prev'),
    $next = $form_tabs.find('.js_form_next'),
    $panels = $form_tabs.find('.js_tabs_content > div'),
    $progress = $('.js_progress'),
    $progress_bar = $('.js_progress_bar'),
    panels_count = $panels.length;

  let current_tab = 1;

  $prev.on('click', function (evt) {
    evt.preventDefault();
    current_tab--;
    change_panel();
  });

  $next.on('click', function (evt) {
    evt.preventDefault();
    current_tab++;
    change_panel();
  });

  function change_panel() {
    $prev.removeClass('disabled');
    $next.removeClass('disabled');

    if (current_tab <= 1) {
      current_tab = 1;
      $prev.addClass('disabled');
    } else if (current_tab >= panels_count) {
      current_tab = panels_count;
      $next.addClass('disabled');
    }

    const target_id = '#js_form_tab_' + current_tab,
      progress = Math.round(((current_tab - 1) / panels_count) * 100) + '%';

    $panels.hide();
    $(target_id).stop(true, true).fadeIn(150);
    $progress.text(progress);
    $progress_bar.css('width', progress);
    update_questions();
  }

  // Активируем первую вкладку при инициализации
  $prev.addClass('disabled');
  $panels.hide().first().show();

  function update_questions() {
    const $questions = $('.js_question_list li');

    $questions.removeClass('current completed');

    $questions
      .filter(function () {
        return parseInt($(this).data('tab'), 10) < current_tab;
      })
      .addClass('completed');

    $questions.filter(`[data-tab=${current_tab}]`).addClass('current');
  }
}

function init_range_sliders() {
  const $ranges = $('.js_range_slider');

  $ranges.each(function () {
    const $range = $(this),
      $slider = $range.find('input[type="range"]'),
      slider_id = $slider.attr('id'),
      $value = $range.find(`label[for="${slider_id}"] span`);

    function update_range_background() {
      const min = Number($slider.attr('min')),
        max = Number($slider.attr('max')),
        val = Number($slider.val()),
        pct = ((val - min) / (max - min)) * 100,
        suffix = $slider.data('suffix');

      let val_text = val.toString();

      $slider.css(
        'background',
        'linear-gradient(90deg, ' + 'var(--color-primary) ' + pct + '%, ' + '#e8e9ec ' + pct + '%)'
      );

      if ($slider.is('.js_price')) {
        val_text = format_number_string(val_text);
      }

      val_text += suffix;
      $value.text(val_text);
    }

    $slider.on('input change', update_range_background);

    update_range_background();
  });

  // format 10000000 into 10 000 000
  function format_number_string(num_str) {
    return num_str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}

function init_form() {
  $('.js_phone_input').on('keydown', function (evt) {
    $(this).mask('+7 (000) 000-00-00');
  });
}

function init_accordion() {
  const $accordions = $('.js_accordion');

  if (!$accordions.length) {
    return false;
  }

  $accordions.each(function () {
    const $accordion = $(this),
      $toggle = $accordion.find('.js_accordion_toggle');

    $toggle.css('cursor', 'pointer');

    $toggle.on('click', function (evt) {
      $content = $(this).closest('.js_accordion').find('.js_accordion_content');

      if ($content.is(':visible')) {
        $content.slideUp(300);
        $(this).addClass('closed');
      } else {
        $content.slideDown(300);
        $(this).removeClass('closed');
      }
    });
  });
}

$(document).ready(function () {
  init_menu();
  init_form();
  init_modals();
  init_custom_select();
  init_tabs();
  init_form_tabs();
  init_range_sliders();
  init_accordion();
});

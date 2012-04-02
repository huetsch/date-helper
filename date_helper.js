(function() {
  var ArgumentError, DateHelper, DateTimeSelector, InstanceTag, TagHelper, clone, root,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  if (typeof window !== "undefined" && window !== null) {
    TagHelper = window.TagHelper;
  } else {
    require('cream');
    TagHelper = require('tag-helper');
  }

  ArgumentError = (function(_super) {

    __extends(ArgumentError, _super);

    function ArgumentError() {
      ArgumentError.__super__.constructor.apply(this, arguments);
    }

    return ArgumentError;

  })(Error);

  clone = function(obj) {
    var key, newInstance;
    if (!(obj != null) || typeof obj !== 'object') return obj;
    newInstance = new obj.constructor();
    for (key in obj) {
      newInstance[key] = clone(obj[key]);
    }
    return newInstance;
  };

  DateTimeSelector = (function() {

    function DateTimeSelector(datetime, options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      this.options = clone(options);
      this.html_options = clone(html_options);
      if (datetime instanceof Date) {
        this.datetime = datetime;
      } else if (datetime) {
        this.datetime = new Date(new String(datetime));
      }
      if (this.options.datetime_separator == null) {
        this.options.datetime_separator = ' &mdash; ';
      }
      if (this.options.time_separator == null) this.options.time_separator = ' : ';
      this.sec = function() {
        var _ref;
        return (_ref = this.datetime) != null ? _ref.getSeconds() : void 0;
      };
      this.min = function() {
        var _ref;
        return (_ref = this.datetime) != null ? _ref.getMinutes() : void 0;
      };
      this.hour = function() {
        var _ref;
        return (_ref = this.datetime) != null ? _ref.getHours() : void 0;
      };
      this.day = function() {
        var _ref;
        return (_ref = this.datetime) != null ? _ref.getDate() : void 0;
      };
      this.month = function() {
        if (this.datetime) return (this.datetime.getMonth() % 12) + 1;
      };
      this.year = function() {
        var _ref;
        return (_ref = this.datetime) != null ? _ref.getFullYear() : void 0;
      };
    }

    DateTimeSelector.prototype.date_order = function() {
      return this.options.order || ['year', 'month', 'day'] || [];
    };

    DateTimeSelector.prototype.select_datetime = function() {
      var o, order, _base, _base2, _base3, _base4, _base5, _i, _len, _ref;
      order = clone(this.date_order());
      order = order.filter(function(x) {
        return x !== 'hour' && x !== 'minute' && x !== 'second';
      });
      (_base = this.options).discard_year || (_base.discard_year = __indexOf.call(order, 'year') < 0 ? true : void 0);
      (_base2 = this.options).discard_month || (_base2.discard_month = __indexOf.call(order, 'month') < 0 ? true : void 0);
      (_base3 = this.options).discard_day || (_base3.discard_day = this.options.discard_month || (__indexOf.call(order, 'day') < 0) ? true : void 0);
      (_base4 = this.options).discard_minute || (_base4.discard_minute = this.options.discard_hour ? true : void 0);
      (_base5 = this.options).discard_second || (_base5.discard_second = !(this.options.include_seconds && (!this.options.discard_minute)) ? true : void 0);
      if (this.datetime && this.options.discard_day && !this.options.discard_month) {
        this.datetime.setDate(1);
      }
      if (this.options.tag && this.options.ignore_date) {
        return this.select_time();
      } else {
        _ref = ['day', 'month', 'year'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          if (__indexOf.call(order, o) < 0) order.unshift(o);
        }
        if (!this.options.discard_hour) {
          order = order.concat(['hour', 'minute', 'second']);
        }
        return (this.build_selects_from_types(order)).valueOf();
      }
    };

    DateTimeSelector.prototype.select_date = function() {
      var o, order, ret, _base, _base2, _base3, _i, _len, _ref;
      order = clone(this.date_order());
      this.options.discard_hour = true;
      this.options.discard_minute = true;
      this.options.discard_second = true;
      (_base = this.options).discard_year || (_base.discard_year = (__indexOf.call(order, 'year') < 0 ? true : void 0));
      (_base2 = this.options).discard_month || (_base2.discard_month = (__indexOf.call(order, 'month') < 0 ? true : void 0));
      (_base3 = this.options).discard_day || (_base3.discard_day = this.options.discard_month || __indexOf.call(order, 'day') < 0 ? true : void 0);
      if (this.datetime && this.options.discard_day && !this.options.discard_month) {
        this.datetime.setDate(1);
      }
      _ref = ['day', 'month', 'year'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i];
        if (__indexOf.call(order, o) < 0) order.unshift(o);
      }
      ret = (this.build_selects_from_types(order)).valueOf();
      return ret;
    };

    DateTimeSelector.prototype.select_time = function() {
      var order, _base;
      order = [];
      this.options.discard_month = true;
      this.options.discard_year = true;
      this.options.discard_day = true;
      (_base = this.options).discard_second || (_base.discard_second = !this.options.include_seconds ? true : void 0);
      if (!this.options.ignore_date) {
        order = order.concat(['year', 'month', 'day']);
      }
      order = order.concat(['hour', 'minute']);
      if (this.options.include_seconds) order.push('second');
      return this.build_selects_from_types(order);
    };

    DateTimeSelector.prototype.select_second = function() {
      if (this.options.use_hidden || this.options.discard_second) {
        if (this.options.include_seconds) {
          return this.build_hidden('second', this.sec());
        } else {
          return '';
        }
      } else {
        return this.build_options_and_select('second', this.sec());
      }
    };

    DateTimeSelector.prototype.select_minute = function() {
      if (this.options.use_hidden || this.options.discard_minute) {
        return this.build_hidden('minute', this.min());
      } else {
        return this.build_options_and_select('minute', this.min(), {
          step: this.options.minute_step
        });
      }
    };

    DateTimeSelector.prototype.select_hour = function() {
      if (this.options.use_hidden || this.options.discard_hour) {
        return this.build_hidden('hour', this.hour());
      } else {
        return this.build_options_and_select('hour', this.hour(), {
          end: 23,
          ampm: this.options.ampm
        });
      }
    };

    DateTimeSelector.prototype.select_day = function() {
      if (this.options.use_hidden || this.options.discard_day) {
        return this.build_hidden('day', this.day());
      } else {
        return this.build_options_and_select('day', this.day(), {
          start: 1,
          end: 31,
          leading_zeros: false
        });
      }
    };

    DateTimeSelector.prototype.select_month = function() {
      var month_number, month_options, options;
      if (this.options.use_hidden || this.options.discard_month) {
        return this.build_hidden('month', this.month());
      } else {
        month_options = [];
        for (month_number = 1; month_number <= 12; month_number++) {
          options = {
            value: month_number
          };
          if (this.month() === month_number) options.selected = "selected";
          month_options.push(TagHelper.content_tag('option', this.month_name(month_number), options) + "\n");
        }
        return this.build_select('month', month_options.join(''));
      }
    };

    DateTimeSelector.prototype.select_year = function() {
      var middle_year, options, val;
      if ((!this.datetime) || this.datetime === 0) {
        val = '';
        middle_year = (new Date()).getFullYear();
      } else {
        val = middle_year = this.year();
      }
      if (this.options.use_hidden || this.options.discard_year) {
        return this.build_hidden('year', val);
      } else {
        options = {};
        options.start = this.options.start_year || (middle_year - 5);
        options.end = this.options.end_year || (middle_year + 5);
        options.step = options.start < options.end ? 1 : -1;
        options.leading_zeros = false;
        return this.build_options_and_select('year', val, options);
      }
    };

    DateTimeSelector.prototype.build_selects_from_types = function(order) {
      var new_select, select, separator, type, _i, _len, _ref;
      select = '';
      _ref = clone(order).reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        if (type === order.first()) {
          separator = '';
        } else {
          separator = this.separator(type);
        }
        new_select = this["select_" + type]();
        select = "" + separator + new_select + select;
      }
      return select.html_safe();
    };

    DateTimeSelector.prototype.separator = function(type) {
      var ret;
      ret = (function() {
        switch (type) {
          case 'year':
            if (this.options.discard_year) {
              return '';
            } else {
              return this.options.date_separator;
            }
            break;
          case 'month':
            if (this.options.discard_month) {
              return '';
            } else {
              return this.options.date_separator;
            }
            break;
          case 'day':
            if (this.options.discard_day) {
              return '';
            } else {
              return this.options.date_separator;
            }
            break;
          case 'hour':
            if (this.options.discard_year && this.options.discard_day) {
              return '';
            } else {
              return this.options.datetime_separator;
            }
            break;
          case 'minute':
            if (this.options.discard_minute) {
              return '';
            } else {
              return this.options.time_separator;
            }
            break;
          case 'second':
            if (this.options.include_seconds) {
              return this.options.time_separator;
            } else {
              return '';
            }
        }
      }).call(this);
      return ret || (ret = '');
    };

    DateTimeSelector.prototype.month_names = function() {
      var month_names;
      month_names = this.options.use_month_names || this.translated_month_names();
      if (month_names.length < 13) month_names.unshift(null);
      return month_names;
    };

    DateTimeSelector.prototype.month_name = function(number) {
      if (this.options.use_month_numbers) {
        return number;
      } else if (this.options.add_month_numbers) {
        return "" + number + " - " + (this.month_names()[number]);
      } else {
        return this.month_names()[number];
      }
    };

    DateTimeSelector.prototype.translated_month_names = function() {
      if (this.options.use_short_month) {
        return [null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      } else {
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      }
    };

    DateTimeSelector.prototype.build_options_and_select = function(type, selected, options) {
      if (options == null) options = {};
      return this.build_select(type, this.build_options(selected, options));
    };

    DateTimeSelector.prototype.AMPM_TRANSLATION = {
      0: "12 AM",
      1: "01 AM",
      2: "02 AM",
      3: "03 AM",
      4: "04 AM",
      5: "05 AM",
      6: "06 AM",
      7: "07 AM",
      8: "08 AM",
      9: "09 AM",
      10: "10 AM",
      11: "11 AM",
      12: "12 PM",
      13: "01 PM",
      14: "02 PM",
      15: "03 PM",
      16: "04 PM",
      17: "05 PM",
      18: "06 PM",
      19: "07 PM",
      20: "08 PM",
      21: "09 PM",
      22: "10 PM",
      23: "11 PM"
    };

    DateTimeSelector.prototype.DEFAULT_PREFIX = 'date';

    DateTimeSelector.prototype.POSITION = {
      year: 1,
      month: 2,
      day: 3,
      hour: 4,
      minute: 5,
      second: 6
    };

    DateTimeSelector.prototype.build_options = function(selected, options) {
      var i, leading_zeros, select_options, start, step, stop, tag_options, text, value;
      if (options == null) options = {};
      start = 0;
      if (options.start) {
        start = options.start;
        delete options.start;
      }
      stop = 59;
      if (options.end) {
        stop = options.end;
        delete options.end;
      }
      step = 1;
      if (options.step) {
        step = options.step;
        delete options.step;
      }
      if (options.leading_zeros == null) options.leading_zeros = true;
      leading_zeros = options.leading_zeros;
      delete options.leading_zeros;
      if (options.ampm == null) options.ampm = false;
      select_options = [];
      for (i = start; start <= stop ? i <= stop : i >= stop; i += step) {
        value = String(i);
        if (leading_zeros) {
          if (value.length === 1) {
            value = "0" + value;
          } else if (value.length === 0) {
            value = "00";
          }
        }
        tag_options = {
          value: value
        };
        if (selected === i) tag_options.selected = "selected";
        text = options.ampm ? this.AMPM_TRANSLATION[i] : value;
        select_options.push(TagHelper.content_tag('option', text, tag_options));
      }
      return (select_options.join("\n") + "\n").html_safe();
    };

    DateTimeSelector.prototype.build_select = function(type, select_options_as_html) {
      var k, select_html, select_options, v, _ref;
      select_options = {
        id: this.input_id_from_type(type),
        name: this.input_name_from_type(type)
      };
      _ref = this.html_options;
      for (k in _ref) {
        v = _ref[k];
        select_options[k] = v;
      }
      if (this.options.disabled) select_options.disabled = 'disabled';
      select_html = "\n";
      if (this.options.include_blank) {
        select_html += TagHelper.content_tag('option', '', {
          value: ''
        }) + "\n";
      }
      if (this.options.prompt) {
        select_html += this.prompt_option_tag(type, this.options.prompt) + "\n";
      }
      select_html += select_options_as_html;
      return (TagHelper.content_tag('select', select_html.html_safe(), select_options) + "\n").html_safe();
    };

    DateTimeSelector.prototype.build_hidden = function(type, value) {
      var html_options;
      html_options = {
        type: 'hidden',
        id: this.input_id_from_type(type),
        name: this.input_name_from_type(type),
        value: value
      };
      if (this.html_options.disabled) html_options = this.html_options.disabled;
      return (TagHelper.tag('input', html_options) + "\n").html_safe();
    };

    DateTimeSelector.prototype.input_name_from_type = function(type) {
      var field_name, k, prefix, v;
      prefix = this.options.prefix || this.DEFAULT_PREFIX;
      if (__indexOf.call((function() {
        var _ref, _results;
        _ref = this.options;
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push(k);
        }
        return _results;
      }).call(this), 'index') >= 0) {
        prefix += "[" + this.options.index + "]";
      }
      field_name = this.options.field_name || type;
      if (this.options.include_position) {
        field_name += "(" + this.POSITION[type] + "i)";
      }
      if (this.options.discard_type) {
        return prefix;
      } else {
        return "" + prefix + "[" + field_name + "]";
      }
    };

    DateTimeSelector.prototype.input_id_from_type = function(type) {
      return this.input_name_from_type(type).replace(/([\[\(])|(\]\[)/g, '_').replace(/[\]\)]/g, '');
    };

    return DateTimeSelector;

  })();

  DateHelper = (function() {

    function DateHelper() {}

    DateHelper.prototype.date_select = function(object_name, method, options, html_options) {
      var tag;
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      delete options.object;
      tag = new InstanceTag(object_name, method, this, options);
      return tag.to_date_select_tag(options, html_options);
    };

    DateHelper.prototype.time_select = function(object_name, method, options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      delete options.object;
      return new InstanceTag(object_name, method, this, options).to_time_select_tag(options, html_options);
    };

    DateHelper.prototype.datetime_select = function(object_name, method, options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      delete options.object;
      return new InstanceTag(object_name, method, this, options).to_datetime_select_tag(options, html_options);
    };

    DateHelper.prototype.select_datetime = function(datetime, options, html_options) {
      if (datetime == null) datetime = new Date();
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return new DateTimeSelector(datetime, options, html_options).select_datetime();
    };

    DateHelper.prototype.select_date = function(date, options, html_options) {
      if (date == null) date = new Date();
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return new DateTimeSelector(date, options, html_options).select_date();
    };

    DateHelper.prototype.select_time = function(datetime, options, html_options) {
      if (datetime == null) datetime = Time.current;
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return new DateTimeSelector(datetime, options, html_options).select_time();
    };

    DateHelper.prototype.select_second = function(datetime, options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return new DateTimeSelector(datetime, options, html_options).select_second();
    };

    DateHelper.prototype.select_minute = function(datetime, options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return new DateTimeSelector(datetime, options, html_options).select_minute();
    };

    DateHelper.prototype.select_hour = function(datetime, options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return new DateTimeSelector(datetime, options, html_options).select_hour();
    };

    DateHelper.prototype.select_day = function(date, options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return new DateTimeSelector(date, options, html_options).select_day();
    };

    DateHelper.prototype.select_month = function(date, options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return new DateTimeSelector(date, options, html_options).select_month();
    };

    DateHelper.prototype.select_year = function(date, options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return new DateTimeSelector(date, options, html_options).select_year();
    };

    return DateHelper;

  })();

  root.DateTimeSelector = DateTimeSelector;

  root.DateHelper = new DateHelper();

  InstanceTag = (function() {

    function InstanceTag(object_name, method_name, template_object, object) {
      var regex, str, _ref;
      if (object == null) object = null;
      _ref = [clone(String(object_name).valueOf()), clone(String(method_name).valueOf())], this.object_name = _ref[0], this.method_name = _ref[1];
      this.template_object = template_object;
      regex = /\[\]$/;
      if (regex.test(this.object_name)) {
        this.object_name = this.object_name.replace(regex, '');
      } else {
        regex = /\[\]\]$/;
        if (regex.test(this.object_name)) {
          this.object_name = this.object_name.replace(regex, ']');
        } else {
          regex = null;
        }
      }
      this.object = this.retrieve_object(object);
      if (regex) {
        str = regex.exec(this.object_name);
        this.auto_index = this.retrieve_autoindex(this.object_name.slice(0, this.object_name.indexOf(str)));
      }
    }

    InstanceTag.prototype.to_date_select_tag = function(options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return this.datetime_selector(options, html_options).select_date().html_safe().valueOf();
    };

    InstanceTag.prototype.to_time_select_tag = function(options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return this.datetime_selector(options, html_options).select_time().html_safe().valueOf();
    };

    InstanceTag.prototype.to_datetime_select_tag = function(options, html_options) {
      if (options == null) options = {};
      if (html_options == null) html_options = {};
      return this.datetime_selector(options, html_options).select_datetime().html_safe().valueOf();
    };

    InstanceTag.prototype.datetime_selector = function(options, html_options) {
      var datetime, _base, _name;
      datetime = (typeof (_base = this.object)[_name = this.method_name] === "function" ? _base[_name]() : void 0) || this.default_datetime(options);
      this.auto_index || (this.auto_index = null);
      options = clone(options);
      options.field_name = this.method_name;
      options.include_position = true;
      options.prefix || (options.prefix = this.object_name);
      if (this.auto_index && !(options.index != null)) {
        options.index = this.auto_index;
      }
      return new DateTimeSelector(datetime, options, html_options);
    };

    InstanceTag.prototype.default_datetime = function(options) {
      var default_options, key, time, _i, _len, _ref;
      if (!(options.include_blank || options.prompt)) {
        if (!options["default"]) {
          return new Date();
        } else if (options["default"] instanceof Date) {
          return options["default"];
        } else {
          default_options = clone(options["default"]);
          default_options.min || (default_options.min = default_options.minute);
          default_options.sec || (default_options.sec = default_options.second);
          time = new Date();
          _ref = ['month', 'hours', 'minutes', 'seconds'];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            default_options[key] || (default_options[key] = time["get" + (key.capitalize())]());
          }
          default_options.fullYear || (default_options.fullYear = time["getFullYear"]());
          default_options.day || (default_options.day = time["getDate"]());
          return new Date(default_options.fullYear, default_options.month, default_options.day, default_options.hours, default_options.minutes, default_options.seconds);
        }
      }
    };

    InstanceTag.prototype.retrieve_object = function(object) {
      if (object) {
        return object;
      } else if (this.template_object["" + this.object_name] != null) {
        return this.template_object["" + this.object_name];
      }
    };

    InstanceTag.prototype.retrieve_autoindex = function(pre_match) {
      var object;
      object = this.object || this.template_object["" + pre_match];
      if (object) {
        return JSON.stringify(object);
      } else {
        throw new ArgumentError("object[] naming but object param and @object var don't exist or don't respond to to_param: " + object.inspect);
      }
    };

    return InstanceTag;

  })();

}).call(this);

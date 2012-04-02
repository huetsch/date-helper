# Copyright (C) 2012 Mark Huetsch
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

TagHelper = require 'tag-helper'
InstanceTag = require 'instance-tag'

class DateTimeSelector
  constructor: (datetime, options = {}, html_options = {}) ->
    #console.log "new datetime selector created"
    @options = Object.clone options
    #console.log "new datetime selector cloned options:"
    #console.log JSON.stringify(@options)

    @html_options = Object.clone html_options
    if datetime instanceof Date
      @datetime = datetime
    else if datetime
      @datetime = new Date(new String(datetime))
    unless @options.datetime_separator?
      @options.datetime_separator = ' &mdash; '
    unless @options.time_separator?
      @options.time_separator = ' : '

    @sec = -> @datetime?.getSeconds()
    @min = -> @datetime?.getMinutes()
    @hour = -> @datetime?.getHours()
    @day = -> @datetime?.getDate()
    @month = -> if @datetime then ((@datetime.getMonth() % 12) + 1)
    @year = -> @datetime?.getFullYear()

  # no localization for now
  date_order: ->
    @options.order or ['year', 'month', 'day'] or []

  select_datetime: ->
    order = Object.clone @date_order()
    ##console.log JSON.stringify(order)
    order = order.filter (x) -> x not in ['hour', 'minute', 'second']

    ##console.log JSON.stringify(order)

    @options.discard_year ||= unless 'year' in order then true
    @options.discard_month ||= unless 'month' in order then true
    @options.discard_day ||= if @options.discard_month or ('day' not in order) then true
    @options.discard_minute ||= if @options.discard_hour then true
    @options.discard_second ||= unless @options.include_seconds and (not @options.discard_minute) then true

    if @datetime and @options.discard_day and not @options.discard_month
      @datetime.setDate(1)

    if @options.tag and @options.ignore_date
      @select_time()
    else
      for o in ['day', 'month', 'year']
        unless o in order
          order.unshift(o)
      unless @options.discard_hour
        order = order.concat ['hour', 'minute', 'second']

      (@build_selects_from_types order).valueOf()

  select_date: ->
    #console.log "select_date called"
    #console.log "@datetime"
    #console.log @datetime?.toString()
    order = Object.clone @date_order()

    @options.discard_hour = true
    @options.discard_minute = true
    @options.discard_second = true
    
    ##console.log JSON.stringify @options
    ##console.log "order: #{JSON.stringify order}"

    @options.discard_year ||= (unless 'year' in order then true)
    @options.discard_month ||= (unless 'month' in order then true)
    @options.discard_day ||= if @options.discard_month or 'day' not in order then true

    ##console.log "order again: #{JSON.stringify order}"
    ##console.log @options

    # If the day is hidden and the month is visible, the day should be set to the 1st so all month choices are
    # valid (otherwise it could be 31 and February wouldn't be a valid date)
    if @datetime and @options.discard_day and not @options.discard_month
      @datetime.setDate(1)

    for o in ['day', 'month', 'year']
      unless o in order
        order.unshift(o)

    ret = (@build_selects_from_types order).valueOf()
    ##console.log ret
    ret

  select_time: ->
    order = []
    
    @options.discard_month = true
    @options.discard_year = true
    @options.discard_day = true
    @options.discard_second ||= unless @options.include_seconds then true

    unless @options.ignore_date
      order = order.concat ['year', 'month', 'day']

    order = order.concat ['hour', 'minute']
    if @options.include_seconds
      order.push 'second'

    @build_selects_from_types order

  select_second: ->
    ##console.log 'select_second called'
    if @options.use_hidden or @options.discard_second
      ##console.log JSON.stringify @options
      if @options.include_seconds
        ##console.log 'including seconds'
        @build_hidden('second', @sec())
      else
        ''
    else
      ##console.log 'not using hidden seconds'
      @build_options_and_select('second', @sec())

  select_minute: ->
    if @options.use_hidden or @options.discard_minute
      @build_hidden('minute', @min())
    else
      @build_options_and_select('minute', @min(), step: @options.minute_step)

  select_hour: ->
    if @options.use_hidden or @options.discard_hour
      @build_hidden('hour', @hour())
    else
      @build_options_and_select('hour', @hour(), end: 23, ampm: @options.ampm)

  select_day: ->
    #console.log "select_day called"
    #console.log "@datetime"
    #console.log @datetime?.toString()
    if @options.use_hidden or @options.discard_day
      @build_hidden('day', @day())
    else
      @build_options_and_select('day', @day(), start: 1, end: 31, leading_zeros: false)

  select_month: ->
    if @options.use_hidden or @options.discard_month
      @build_hidden('month', @month())
    else
      month_options = []
      for month_number in [1..12]
        options = value: month_number
        if @month() is month_number
          options.selected = "selected"
        month_options.push TagHelper.content_tag('option', @month_name(month_number), options) + "\n"
      @build_select('month', month_options.join(''))

  select_year: ->
    #console.log "select_year called"
    if (not @datetime) or @datetime is 0
      val = ''
      middle_year = (new Date()).getFullYear()
    else
      val = middle_year = @year()

    #console.log "@datetime"
    #console.log @datetime?.toString()
    #console.log "middle year: #{middle_year}"
    if @options.use_hidden or @options.discard_year
      @build_hidden('year', val)
    else
      options = {}
      options.start = @options.start_year or (middle_year - 5)
      options.end = @options.end_year or (middle_year + 5)
      options.step = if options.start < options.end then 1 else -1
      options.leading_zeros = false

      @build_options_and_select('year', val, options)

  build_selects_from_types: (order) ->
    #console.log "build_selects_from_types called"
    #console.log "@datetime"
    #console.log @datetime?.toString()
    select = ''
    for type in Object.clone(order).reverse()
      if type is order.first() # don't add on last field
        separator = ''
      else
        separator = @separator(type)
      new_select = @["select_#{type}"]()
      select = "#{separator}#{new_select}#{select}"
      ##console.log "select_#{type}"
      ##console.log new_select.valueOf()
    select.html_safe()

  separator: (type) ->
    ret = switch type
      when 'year'
        if @options.discard_year then '' else @options.date_separator
      when 'month'
        if @options.discard_month then '' else @options.date_separator
      when 'day'
        if @options.discard_day then '' else @options.date_separator
      when 'hour'
        if @options.discard_year and @options.discard_day then '' else @options.datetime_separator
      when 'minute'
        if @options.discard_minute then '' else @options.time_separator
      when 'second'
        if @options.include_seconds then @options.time_separator else ''
    ret ||= ''

  # Returns translated month names, but also ensures that a custom month
  # name array has a leading null element.
  month_names: ->
    month_names = @options.use_month_names or @translated_month_names()
    if month_names.length < 13
      month_names.unshift(null)
    month_names

  month_name: (number) ->
    if @options.use_month_numbers
      number
    else if @options.add_month_numbers
      "#{number} - #{@month_names()[number]}"
    else
      @month_names()[number]

  # i18n currently unsupported
  translated_month_names: ->
    if @options.use_short_month
      [null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    else
      ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  build_options_and_select: (type, selected, options = {}) ->
    @build_select(type, @build_options(selected, options))

  AMPM_TRANSLATION:
    0: "12 AM", 1: "01 AM", 2: "02 AM", 3: "03 AM",
    4: "04 AM", 5: "05 AM", 6: "06 AM", 7: "07 AM",
    8: "08 AM", 9: "09 AM", 10: "10 AM", 11: "11 AM",
    12: "12 PM", 13: "01 PM", 14: "02 PM", 15: "03 PM",
    16: "04 PM", 17: "05 PM", 18: "06 PM", 19: "07 PM",
    20: "08 PM", 21: "09 PM", 22: "10 PM", 23: "11 PM"

  DEFAULT_PREFIX: 'date'
  POSITION: {year: 1, month: 2, day: 3, hour: 4, minute: 5, second: 6}

  build_options: (selected, options = {}) ->
    start = 0
    if options.start
      start = options.start
      delete options.start
    stop = 59
    if options.end
      stop = options.end
      delete options.end
    step = 1
    if options.step
      step = options.step
      delete options.step
    unless options.leading_zeros?
      options.leading_zeros = true
    leading_zeros = options.leading_zeros
    delete options.leading_zeros
    unless options.ampm?
      options.ampm = false

    select_options = []
    for i in [start..stop] by step
      value = String i
      # we don't have sprintf..., otherwise value = =sprint("%02d", i)
      if leading_zeros
        if value.length is 1
          value = "0#{value}"
        else if value.length is 0
          value = "00"
      tag_options = value: value
      if selected is i
        tag_options.selected = "selected"
      ##console.log @AMPM_TRANSLATION
      text = if options.ampm then @AMPM_TRANSLATION[i] else value
      select_options.push TagHelper.content_tag('option', text, tag_options)
    (select_options.join("\n") + "\n").html_safe()

  build_select: (type, select_options_as_html) ->
    select_options = id: @input_id_from_type(type), name: @input_name_from_type(type)
    for k, v of @html_options
      select_options[k] = v
    if @options.disabled
      select_options.disabled = 'disabled'

    select_html = "\n"
    if @options.include_blank
      select_html += TagHelper.content_tag('option', '', value: '') + "\n"
    if @options.prompt
      select_html += @prompt_option_tag(type, @options.prompt) + "\n"
    select_html += select_options_as_html

    (TagHelper.content_tag('select', select_html.html_safe(), select_options) + "\n").html_safe()

  build_hidden: (type, value) ->
    html_options = type: 'hidden', id: @input_id_from_type(type), name: @input_name_from_type(type), value: value
    if @html_options.disabled
      html_options = @html_options.disabled
    (TagHelper.tag('input', html_options) + "\n").html_safe()

  input_name_from_type: (type) ->
    prefix = @options.prefix or @DEFAULT_PREFIX
    if 'index' in (k for k, v of @options)
      prefix += "[#{@options.index}]"

    field_name = @options.field_name or type
    ##console.log "input_name_from_type: #{type}"
    if @options.include_position
      field_name += "(#{@POSITION[type]}i)"

    if @options.discard_type then prefix else "#{prefix}[#{field_name}]"

  input_id_from_type: (type) ->
    @input_name_from_type(type).replace(/([\[\(])|(\]\[)/g, '_').replace(/[\]\)]/g, '')

exports.DateTimeSelector = DateTimeSelector

# TODO prompt_tag
class DateHelper
  date_select: (object_name, method, options = {}, html_options = {}) ->
    delete options.object
    #console.log 'building tag'
    tag = new InstanceTag(object_name, method, @, options)
    #console.log 'done building tag'
    #console.log tag
    tag.to_date_select_tag(options, html_options)
    #new InstanceTag(object_name, method, @, options).to_date_select_tag(options, html_options)

  time_select: (object_name, method, options = {}, html_options = {}) ->
    delete options.object
    new InstanceTag(object_name, method, @, options).to_time_select_tag(options, html_options)

  datetime_select: (object_name, method, options = {}, html_options = {}) ->
    delete options.object
    new InstanceTag(object_name, method, @, options).to_datetime_select_tag(options, html_options)

  select_datetime: (datetime = new Date(), options = {}, html_options = {}) ->
    new DateTimeSelector(datetime, options, html_options).select_datetime()

  select_date: (date = new Date(), options = {}, html_options = {}) ->
    new DateTimeSelector(date, options, html_options).select_date()

  select_time: (datetime = Time.current, options = {}, html_options = {}) ->
    new DateTimeSelector(datetime, options, html_options).select_time()

  select_second: (datetime, options = {}, html_options = {}) ->
    new DateTimeSelector(datetime, options, html_options).select_second()

  select_minute: (datetime, options = {}, html_options = {}) ->
    new DateTimeSelector(datetime, options, html_options).select_minute()

  select_hour: (datetime, options = {}, html_options = {}) ->
    new DateTimeSelector(datetime, options, html_options).select_hour()

  select_day: (date, options = {}, html_options = {}) ->
    new DateTimeSelector(date, options, html_options).select_day()

  select_month: (date, options = {}, html_options = {}) ->
    new DateTimeSelector(date, options, html_options).select_month()

  select_year: (date, options = {}, html_options = {}) ->
    new DateTimeSelector(date, options, html_options).select_year()

InstanceTag::to_date_select_tag = (options = {}, html_options = {}) ->
  @datetime_selector(options, html_options).select_date().html_safe().valueOf()

InstanceTag::to_time_select_tag = (options = {}, html_options = {}) ->
  @datetime_selector(options, html_options).select_time().html_safe().valueOf()

InstanceTag::to_datetime_select_tag = (options = {}, html_options = {}) ->
  @datetime_selector(options, html_options).select_datetime().html_safe().valueOf()

InstanceTag::datetime_selector = (options, html_options) ->
  #console.log 'entering datetime_selector'
  #console.log '@object:'
  #console.log @object
  #console.log '@method_name:'
  #console.log @method_name
  # TODO this is or'd with value(object) in Rails, but I don't totally understand what that means
  #console.log "default_datetime(options) #{@default_datetime(options)}"
  datetime = @object[@method_name]?() or @default_datetime(options)
  #console.log 'datetime:'
  #console.log datetime
  @auto_index ||= null

  options = Object.clone(options)
  options.field_name = @method_name
  options.include_position = true
  options.prefix ||= @object_name
  options.index = @auto_index if (@auto_index and not options.index?)

  new DateTimeSelector(datetime, options, html_options)

InstanceTag::default_datetime = (options) ->
  #console.log 'entering default_datetime'
  #console.log 'options'
  #console.log options
  unless options.include_blank or options.prompt
    if not options.default
      new Date()
    else if options.default instanceof Date
      options.default
    else
      default_options = Object.clone options.default

      # rename 'minute' and 'second' to 'min' and 'sec'

      # XXX this is a date object, unlike the ruby, we can't just set the attributes this way
      default_options.min ||= default_options.minute
      default_options.sec ||= default_options.second

      time = new Date()

      # date -> day...
      for key in ['month', 'hours', 'minutes', 'seconds']
        default_options[key] ||= time["get#{key.capitalize()}"]()
      default_options.fullYear ||= time["getFullYear"]()
      default_options.day ||= time["getDate"]()
      #console.log 'default options'
      #console.log default_options

      new Date(default_options.fullYear, default_options.month, default_options.day, default_options.hours, default_options.minutes, default_options.seconds)

exports.DateHelper = new DateHelper()

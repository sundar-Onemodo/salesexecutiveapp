declare module 'react-native-calendar-picker' {
  import { Component } from 'react';
  import { StyleProp, TextStyle, ViewStyle } from 'react-native';
  import { Moment } from 'moment';

  export interface CalendarPickerProps {
    allowRangeSelection?: boolean;
    startFromMonday?: boolean;
    showDayStragglers?: boolean;
    minDate?: Date | Moment;
    maxDate?: Date | Moment;
    selectedStartDate?: Date | Moment;
    selectedEndDate?: Date | Moment;
    initialDate?: Date | Moment;
    selectedDayColor?: string;
    selectedDayTextColor?: string;
    selectedDayStyle?: StyleProp<ViewStyle>;
    selectedDayTextStyle?: StyleProp<TextStyle>;
    selectedRangeStartStyle?: StyleProp<ViewStyle>;
    selectedRangeEndStyle?: StyleProp<ViewStyle>;
    selectedRangeStyle?: StyleProp<ViewStyle>;
    selectedRangeStartTextStyle?: StyleProp<TextStyle>;
    selectedRangeEndTextStyle?: StyleProp<TextStyle>;
    todayBackgroundColor?: string;
    todayTextStyle?: StyleProp<TextStyle>;
    textStyle?: StyleProp<TextStyle>;
    customDatesStyles?: any[];
    scaleFactor?: number;
    width?: number;
    height?: number;
    onDateChange?: (date: Moment, type: 'START_DATE' | 'END_DATE') => void;
    onMonthChange?: (date: Moment) => void;
    previousTitle?: string;
    nextTitle?: string;
    previousTitleStyle?: StyleProp<TextStyle>;
    nextTitleStyle?: StyleProp<TextStyle>;
    monthTitleStyle?: StyleProp<TextStyle>;
    yearTitleStyle?: StyleProp<TextStyle>;
    headerWrapperStyle?: StyleProp<ViewStyle>;
    dayLabelsWrapperStyle?: StyleProp<ViewStyle>;
    restrictMonthNavigation?: boolean;
    maxRangeDuration?: number;
    minRangeDuration?: number;
  }

  export default class CalendarPicker extends Component<CalendarPickerProps> {}
}

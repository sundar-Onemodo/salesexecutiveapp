import { AppColors } from "@/constants/colors";
import moment, { Moment } from "moment";
import { useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface CalendarPickerProps {
  startFromMonday?: boolean;
  allowRangeSelection?: boolean;
  selectedStartDate?: Date | Moment | null;
  selectedEndDate?: Date | Moment | null;
  onDateChange?: (date: Moment, type: "START_DATE" | "END_DATE") => void;
  width?: number;
  minDate?: Date | Moment;
  maxDate?: Date | Moment;
  selectedDayColor?: string;
  selectedDayTextColor?: string;
  selectedRangeStyle?: StyleProp<ViewStyle>;
  selectedRangeStartStyle?: StyleProp<ViewStyle>;
  selectedRangeEndStyle?: StyleProp<ViewStyle>;
  todayBackgroundColor?: string;
  todayTextStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  previousTitle?: string;
  nextTitle?: string;
  previousTitleStyle?: StyleProp<TextStyle>;
  nextTitleStyle?: StyleProp<TextStyle>;
  monthTitleStyle?: StyleProp<TextStyle>;
  yearTitleStyle?: StyleProp<TextStyle>;
}

export default function CalendarPicker({
  startFromMonday = true,
  allowRangeSelection = true,
  selectedStartDate,
  selectedEndDate,
  onDateChange,
  width,
  minDate,
  maxDate,
  selectedDayColor = AppColors.dominant,
  selectedDayTextColor = AppColors.white,
  selectedRangeStyle,
  selectedRangeStartStyle,
  selectedRangeEndStyle,
  todayBackgroundColor = AppColors.primaryLight,
  todayTextStyle,
  textStyle,
  previousTitle = "‹ Prev",
  nextTitle = "Next ›",
  previousTitleStyle,
  nextTitleStyle,
  monthTitleStyle,
  yearTitleStyle,
}: CalendarPickerProps) {
  // Current viewing month override (when user navigates months)
  const [viewingMonth, setViewingMonth] = useState<Moment | null>(null);

  // Derived current viewing month: user navigated month, or selectedStartDate's month, or this month
  const currentMonth =
    viewingMonth ||
    (selectedStartDate
      ? moment(selectedStartDate).startOf("month")
      : moment().startOf("month"));

  const handlePrevMonth = () => {
    setViewingMonth(currentMonth.clone().subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setViewingMonth(currentMonth.clone().add(1, "month"));
  };

  // Weekdays header
  const weekdays = startFromMonday
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Days in month calculation
  const startOfMonth = currentMonth.clone().startOf("month");
  const daysInMonth = currentMonth.daysInMonth();

  // Day offset for the 1st day of month
  // moment().day(): 0=Sun, 1=Mon, ..., 6=Sat
  let firstDayOffset: number;
  if (startFromMonday) {
    const d = startOfMonth.day();
    firstDayOffset = d === 0 ? 6 : d - 1; // Mon=0, Sun=6
  } else {
    firstDayOffset = startOfMonth.day(); // Sun=0, Sat=6
  }

  // Parse start & end moment
  const startMoment = selectedStartDate
    ? moment(selectedStartDate).startOf("day")
    : null;
  const endMoment = selectedEndDate
    ? moment(selectedEndDate).startOf("day")
    : null;
  const todayMoment = moment().startOf("day");

  // Handle day press
  const handleDayPress = (dayNum: number) => {
    const clicked = currentMonth.clone().date(dayNum).startOf("day");

    if (!allowRangeSelection) {
      onDateChange?.(clicked, "START_DATE");
      return;
    }

    if (!startMoment || (startMoment && endMoment)) {
      // Starting a new selection
      onDateChange?.(clicked, "START_DATE");
    } else {
      // We already have startMoment and are choosing endMoment
      if (clicked.isBefore(startMoment, "day")) {
        // Clicked before start: restart range with clicked date
        onDateChange?.(clicked, "START_DATE");
      } else {
        onDateChange?.(clicked, "END_DATE");
      }
    }
  };

  // Build grid cells
  const gridCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) {
    gridCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push(d);
  }
  // Fill trailing cells to complete the 7-day row
  while (gridCells.length % 7 !== 0) {
    gridCells.push(null);
  }

  // Split into rows of 7
  const rows: (number | null)[][] = [];
  for (let i = 0; i < gridCells.length; i += 7) {
    rows.push(gridCells.slice(i, i + 7));
  }

  return (
    <View style={[styles.container, width ? { width } : { width: "100%" }]}>
      {/* Month Navigation Controls */}
      <View style={styles.navRow}>
        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            pressed && styles.navBtnPressed,
          ]}
          onPress={handlePrevMonth}
          hitSlop={8}
        >
          <Text style={[styles.navBtnText, previousTitleStyle]}>
            {previousTitle}
          </Text>
        </Pressable>

        <View style={styles.monthYearTitle}>
          <Text style={[styles.monthText, monthTitleStyle]}>
            {currentMonth.format("MMMM")}{" "}
            <Text style={[styles.yearText, yearTitleStyle]}>
              {currentMonth.format("YYYY")}
            </Text>
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            pressed && styles.navBtnPressed,
          ]}
          onPress={handleNextMonth}
          hitSlop={8}
        >
          <Text style={[styles.navBtnText, nextTitleStyle]}>{nextTitle}</Text>
        </Pressable>
      </View>

      {/* Weekdays Row */}
      <View style={styles.weekdaysRow}>
        {weekdays.map((wd, idx) => (
          <View key={`wd-${idx}`} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid Rows */}
      <View style={styles.gridContainer}>
        {rows.map((row, rowIdx) => (
          <View key={`row-${rowIdx}`} style={styles.weekRow}>
            {row.map((dayNum, colIdx) => {
              if (dayNum === null) {
                return (
                  <View
                    key={`empty-${rowIdx}-${colIdx}`}
                    style={styles.dayCell}
                  />
                );
              }

              const cellMoment = currentMonth
                .clone()
                .date(dayNum)
                .startOf("day");
              const isToday = cellMoment.isSame(todayMoment, "day");
              const isStart = startMoment
                ? cellMoment.isSame(startMoment, "day")
                : false;
              const isEnd = endMoment
                ? cellMoment.isSame(endMoment, "day")
                : false;
              const hasFullRange =
                startMoment &&
                endMoment &&
                !startMoment.isSame(endMoment, "day");
              const isInRange =
                hasFullRange &&
                cellMoment.isAfter(startMoment, "day") &&
                cellMoment.isBefore(endMoment, "day");

              const isDisabled =
                (minDate &&
                  cellMoment.isBefore(moment(minDate).startOf("day"), "day")) ||
                (maxDate &&
                  cellMoment.isAfter(moment(maxDate).startOf("day"), "day"));

              return (
                <View key={`day-${dayNum}`} style={styles.dayCell}>
                  {/* Range Highlight Ribbon */}
                  {hasFullRange && (
                    <View
                      style={[
                        styles.rangeRibbon,
                        isStart && styles.rangeRibbonStart,
                        isEnd && styles.rangeRibbonEnd,
                        isInRange && styles.rangeRibbonMiddle,
                        selectedRangeStyle,
                      ]}
                    />
                  )}

                  {/* Day Circle Button */}
                  <Pressable
                    disabled={!!isDisabled}
                    onPress={() => handleDayPress(dayNum)}
                    style={({ pressed }) => [
                      styles.dayButton,
                      isToday &&
                        !isStart &&
                        !isEnd && {
                          backgroundColor: todayBackgroundColor,
                          borderColor: AppColors.primaryBorder,
                          borderWidth: 1,
                        },
                      (isStart || isEnd) && {
                        backgroundColor: selectedDayColor,
                      },
                      isStart && selectedRangeStartStyle,
                      isEnd && selectedRangeEndStyle,
                      pressed && !isStart && !isEnd && styles.dayButtonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumberText,
                        textStyle,
                        isToday &&
                          !isStart &&
                          !isEnd && [styles.todayText, todayTextStyle],
                        (isStart || isEnd) && {
                          color: selectedDayTextColor,
                          fontWeight: "800",
                        },
                        isInRange && styles.inRangeText,
                        isDisabled && styles.disabledText,
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    alignItems: "center",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: AppColors.cardSecondary,
  },
  navBtnPressed: {
    opacity: 0.7,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.dominant,
  },
  monthYearTitle: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.surface,
  },
  yearText: {
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.surface,
  },
  weekdaysRow: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderMuted,
    marginBottom: 6,
  },
  weekdayCell: {
    width: "14.285%",
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.mutedSlate,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  gridContainer: {
    width: "100%",
  },
  weekRow: {
    flexDirection: "row",
    width: "100%",
    marginVertical: 2,
    alignItems: "center",
  },
  dayCell: {
    width: "14.285%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  rangeRibbon: {
    position: "absolute",
    top: 3,
    bottom: 3,
    backgroundColor: "#DBEAFE",
  },
  rangeRibbonStart: {
    left: "50%",
    right: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  rangeRibbonEnd: {
    left: 0,
    right: "50%",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  rangeRibbonMiddle: {
    left: 0,
    right: 0,
  },
  dayButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  dayButtonPressed: {
    backgroundColor: AppColors.primaryLight,
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  todayText: {
    color: AppColors.dominant,
    fontWeight: "800",
  },
  inRangeText: {
    color: AppColors.dominant,
    fontWeight: "700",
  },
  disabledText: {
    color: AppColors.border,
    fontWeight: "400",
  },
});

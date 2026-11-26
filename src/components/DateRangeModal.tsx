import { AppColors } from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import moment, { Moment } from "moment";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CalendarPicker from "./CalendarPicker";

interface DateRangeModalProps {
  visible: boolean;
  initialFromDate: string; // YYYY-MM-DD
  initialToDate: string; // YYYY-MM-DD
  onClose: () => void;
  onApply: (fromDate: string, toDate: string) => void;
}

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  visible,
  initialFromDate,
  initialToDate,
  onClose,
  onApply,
}) => {
  const [selectedStart, setSelectedStart] = useState<Moment | null>(() =>
    initialFromDate
      ? moment(initialFromDate, "YYYY-MM-DD")
      : moment().subtract(7, "days"),
  );
  const [selectedEnd, setSelectedEnd] = useState<Moment | null>(() =>
    initialToDate ? moment(initialToDate, "YYYY-MM-DD") : moment(),
  );

  const screenWidth = Dimensions.get("window").width;
  const calendarWidth = Math.min(screenWidth - 48, 360);

  const onDateChange = (date: Moment, type: "START_DATE" | "END_DATE") => {
    if (type === "END_DATE") {
      setSelectedEnd(date);
    } else {
      setSelectedStart(date);
      // Clear end date when new start date selected
      setSelectedEnd(null);
    }
  };

  const handleApply = () => {
    if (selectedStart) {
      const fromStr = selectedStart.format("YYYY-MM-DD");
      const toStr = selectedEnd ? selectedEnd.format("YYYY-MM-DD") : fromStr;
      onApply(fromStr, toStr);
      onClose();
    }
  };

  // Quick Presets
  const setPreset = (daysBack: number) => {
    const end = moment();
    const start = moment().subtract(daysBack, "days");
    setSelectedStart(start);
    setSelectedEnd(end);
  };

  const setThisMonth = () => {
    setSelectedStart(moment().startOf("month"));
    setSelectedEnd(moment());
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.indicator} />
                <View style={styles.headerRow}>
                  <View>
                    <Text style={styles.sheetTitle}>Select Date Range</Text>
                    <Text style={styles.sheetSubtitle}>
                      Filter collections & daily summary chart
                    </Text>
                  </View>
                  <Pressable style={styles.closeBtn} onPress={onClose}>
                    <Ionicons
                      name="close"
                      size={20}
                      color={AppColors.mutedSlate}
                    />
                  </Pressable>
                </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollBody}
              >
                {/* Selected Range Display Banner */}
                <View style={styles.selectedBanner}>
                  <View style={styles.dateBlock}>
                    <Text style={styles.dateBlockLabel}>FROM</Text>
                    <Text style={styles.dateBlockVal}>
                      {selectedStart
                        ? selectedStart.format("DD MMM YYYY")
                        : "Select Start"}
                    </Text>
                  </View>

                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={AppColors.dominant}
                  />

                  <View style={styles.dateBlock}>
                    <Text style={styles.dateBlockLabel}>TO</Text>
                    <Text style={styles.dateBlockVal}>
                      {selectedEnd
                        ? selectedEnd.format("DD MMM YYYY")
                        : selectedStart
                          ? selectedStart.format("DD MMM YYYY")
                          : "Select End"}
                    </Text>
                  </View>
                </View>

                {/* Quick Preset Buttons */}
                <View style={styles.presetsRow}>
                  <Pressable
                    style={styles.presetPill}
                    onPress={() => setPreset(0)}
                  >
                    <Text style={styles.presetPillText}>Today</Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetPill}
                    onPress={() => setPreset(7)}
                  >
                    <Text style={styles.presetPillText}>Last 7 Days</Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetPill}
                    onPress={() => setPreset(14)}
                  >
                    <Text style={styles.presetPillText}>Last 14 Days</Text>
                  </Pressable>
                  <Pressable style={styles.presetPill} onPress={setThisMonth}>
                    <Text style={styles.presetPillText}>This Month</Text>
                  </Pressable>
                </View>

                {/* React Native Calendar Picker */}
                <View style={styles.calendarCard}>
                  <CalendarPicker
                    startFromMonday={true}
                    allowRangeSelection={true}
                    selectedStartDate={
                      selectedStart ? selectedStart.toDate() : undefined
                    }
                    selectedEndDate={
                      selectedEnd ? selectedEnd.toDate() : undefined
                    }
                    onDateChange={onDateChange}
                    width={calendarWidth}
                    selectedDayColor={AppColors.dominant}
                    selectedDayTextColor={AppColors.white}
                    selectedRangeStyle={{ backgroundColor: "#DBEAFE" }}
                    selectedRangeStartStyle={{
                      backgroundColor: AppColors.dominant,
                    }}
                    selectedRangeEndStyle={{
                      backgroundColor: AppColors.dominant,
                    }}
                    todayBackgroundColor={AppColors.primaryLight}
                    todayTextStyle={{
                      color: AppColors.dominant,
                      fontWeight: "700",
                    }}
                    textStyle={{
                      color: AppColors.textPrimary,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                    previousTitle="‹ Prev"
                    nextTitle="Next ›"
                    previousTitleStyle={{
                      color: AppColors.dominant,
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                    nextTitleStyle={{
                      color: AppColors.dominant,
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                    monthTitleStyle={{
                      color: AppColors.surface,
                      fontWeight: "800",
                      fontSize: 15,
                    }}
                    yearTitleStyle={{
                      color: AppColors.surface,
                      fontWeight: "800",
                      fontSize: 15,
                    }}
                  />
                </View>

                {/* Apply Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.applyButton,
                    !selectedStart && styles.applyButtonDisabled,
                    pressed && styles.applyButtonPressed,
                  ]}
                  disabled={!selectedStart}
                  onPress={handleApply}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={AppColors.white}
                  />
                  <Text style={styles.applyButtonText}>Apply Date Range</Text>
                </Pressable>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: AppColors.overlay,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: AppColors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 24,
    elevation: 20,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sheetHeader: {
    alignItems: "center",
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderMuted,
  },
  indicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.border,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.surface,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollBody: {
    padding: 16,
    alignItems: "center",
  },
  selectedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1,
    borderColor: AppColors.primaryBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
    marginBottom: 12,
  },
  dateBlock: {
    flex: 1,
  },
  dateBlockLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: AppColors.mutedSlate,
    letterSpacing: 0.5,
  },
  dateBlockVal: {
    fontSize: 14,
    fontWeight: "800",
    color: AppColors.dominant,
    marginTop: 2,
  },
  presetsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
    width: "100%",
    justifyContent: "space-between",
  },
  presetPill: {
    flex: 1,
    backgroundColor: AppColors.cardSecondary,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  presetPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  calendarCard: {
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppColors.dominant,
    height: 50,
    borderRadius: 12,
    width: "100%",
    elevation: 3,
    shadowColor: AppColors.dominant,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  applyButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});

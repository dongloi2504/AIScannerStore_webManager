import { Form } from "react-bootstrap";
import Select from "react-select";
import { useState } from "react";
import "../Styles/DataTable.css";
import { DATE_PRESETS, getDateRange, toDateTimeLocal } from "../const/DateRange";
const ReportDateTimePicker = ({ 
  startAt, 
  endAt, 
  setStartAt, 
  setEndAt,
  onDatePickerChange,
  onPresetChange,
 }) => {
  const options = [
    { label: "Last 28 day", value: DATE_PRESETS.last_28_days },
    { label: "This Month", value: DATE_PRESETS.this_month },
    { label: "This Week", value: DATE_PRESETS.this_week },
    { label: "Last Month", value: DATE_PRESETS.last_month },
    { label: "Last Week", value: DATE_PRESETS.last_week },
    { label: "Custom", value: DATE_PRESETS.custom },
  ];
  const custom_index = 5;
  const [dateTimePreset, setDateTimePreset] = useState(options[0]);
  const handleDateTimeChange = (start, end) => {
    console.log("DATEPICKER");
    setDateTimePreset(options[custom_index]);
    typeof setStartAt === "function" && setStartAt(start);
    typeof setEndAt === "function" && setEndAt(end);
    typeof onDatePickerChange === "function" && onDatePickerChange(start,end);
  };
  const handleSelectChange = (selected) => {
    setDateTimePreset(selected);
    var timeSpan = getDateRange(selected.value);
    console.log("PRESET" + JSON.stringify(timeSpan));
    if(selected.value === DATE_PRESETS.custom) return;
    typeof setStartAt === "function" && setStartAt(toDateTimeLocal(timeSpan.startAt));
    typeof setEndAt === "function" && setEndAt(toDateTimeLocal(timeSpan.endAt));
    typeof onPresetChange === "function" && onPresetChange(selected.value);
  };

  return (
    <>
      <div className="search-container">
        <Form.Label>Start Date</Form.Label>
        <Form.Control
          type="datetime-local"
          value={startAt || ""}
          onChange={(e) => handleDateTimeChange(e.target.value, endAt)}
        />
        <Form.Label>End Date</Form.Label>
        <Form.Control
          type="datetime-local"
          value={endAt || ""}
          onChange={(e) => handleDateTimeChange(startAt, e.target.value)}
        />
        <Select
          onChange={(selected) => handleSelectChange(selected)}
          options={options}
          value={dateTimePreset}
        />
      </div>
    </>
  );
};
export default ReportDateTimePicker;

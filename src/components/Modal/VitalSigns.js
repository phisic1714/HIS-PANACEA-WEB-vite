import React, { useEffect, useState } from 'react'
import {
    Row, Col, Button, Modal, notification,
    Form, Checkbox, ConfigProvider,
} from 'antd';
import { map, find, filter, toNumber, uniqBy, differenceBy, sortBy, groupBy } from 'lodash'
import { nanoid } from 'nanoid'
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import DayjsDatePicker from "../../components/DatePicker/DayjsDatePicker";
import dayjs from "dayjs";
import thTH from "antd/lib/locale/th_TH";

export default function ModalVitalSigns({
    isVisible = false,
    setIsVisible = () => console.log("Vital Signs"),
    dataSource = []
}) {
    console.log('dataSource', dataSource)
    // const userFromSession = JSON.parse(sessionStorage.getItem("user"));
    // const user = userFromSession.responseData.userId;
    const [form] = Form.useForm();

    const [chartName, setChartName] = useState(null)
    const [dataForChart, setDataForChart] = useState({});

    const onFinish = () => {
        // console.log('values', values)
        ManageDataSource()
    }

    const [chkValues, setChkValues] = useState(['bp', 'bmi', "bodyTemp"]);
    const [indeterminate, setIndeterminate] = useState(true);
    const [checkAll, setCheckAll] = useState(false);
    const onChangeChk = (list) => {
        setChkValues(list)
        setIndeterminate(!!list.length && list.length < options.length);
        setCheckAll(list.length === options.length);
    }
    const onCheckAllChange = (e) => {
        let mapping = map(options, 'value')
        setChkValues(e.target.checked ? mapping : []);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
    };
    const chart = (group, listData, groupSize) => {
        let root = am5.Root.new(`${chartName}`);
        // Set themes
        // https://www.amcharts.com/docs/v5/concepts/themes/
        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        // Create chart
        // https://www.amcharts.com/docs/v5/charts/xy-chart/
        let chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: false,
                panY: false,
                wheelX: "none",
                wheelY: "none"
            })
        );

        // Add cursor
        // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
        let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
        cursor.lineY.set("visible", false);

        // Create axes
        // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
        let xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
        xRenderer.labels.template.setAll({ text: "{realName}" });
        let yRendererBp = am5xy.AxisRendererY.new(root, {});
        let yRendererBmi = am5xy.AxisRendererY.new(root, {});
        let yRendererBodyTemp = am5xy.AxisRendererY.new(root, {});
        let yRendererPulse = am5xy.AxisRendererY.new(root, {});
        let yRendererResRate = am5xy.AxisRendererY.new(root, {});
        let yRendererO2Sat = am5xy.AxisRendererY.new(root, {});
        let yRendererWeight = am5xy.AxisRendererY.new(root, {});
        let yRendererHeight = am5xy.AxisRendererY.new(root, {});
        let yRendererHC = am5xy.AxisRendererY.new(root, {});
        let yRendererChestlineIn = am5xy.AxisRendererY.new(root, {});

        let xAxis = chart.xAxes.push(
            am5xy.CategoryAxis.new(root, {
                maxDeviation: 0,
                categoryField: "category",
                renderer: xRenderer,
                tooltip: am5.Tooltip.new(root, {
                    labelText: "{realName}"
                }),
            })
        );
        let yAxisBp = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0.3,
                renderer: yRendererBp,
            })
        );
        let yAxisBmi = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0.3,
                renderer: yRendererBmi
            })
        );
        let yAxisBodyTemp = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0.3,
                renderer: yRendererBodyTemp
            })
        );
        let yAxisPulse = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0.3,
                renderer: yRendererPulse
            })
        );
        let yAxisResRate = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0.3,
                renderer: yRendererResRate
            })
        );
        let yAxisO2Sat = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0.3,
                renderer: yRendererO2Sat
            })
        );
        let yAxisWeight = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0.3,
                renderer: yRendererWeight
            })
        );
        let yAxisHeight = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0.3,
                renderer: yRendererHeight
            })
        );
        let yAxisHC = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0.3,
                renderer: yRendererHC
            })
        );
        let yAxisChestlineIn = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0.3,
                renderer: yRendererChestlineIn
            })
        );

        // Create series
        // https://www.amcharts.com/docs/v5/charts/xy-chart/series/

        // BP
        let seriesBp = chart.series.push(
            am5xy.ColumnSeries.new(root, {
                name: "mmHg",
                xAxis: xAxis,
                yAxis: yAxisBp,
                valueYField: "bpClose",
                openValueYField: "bpOpen",
                categoryXField: "category",
                stroke: "#00C853",
                fill: "#00C853",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "BP {openValueY} - {valueY}"
                })
            })
        );
        seriesBp.columns.template.setAll({
            width: 0.5
        });
        seriesBp.bullets.push(function () {
            return am5.Bullet.new(root, {
                locationY: 0,
                sprite: am5.Circle.new(root, {
                    radius: 5,
                    fill: "#00C853"
                })
            })
        })

        seriesBp.bullets.push(function () {
            return am5.Bullet.new(root, {
                locationY: 1,
                sprite: am5.Circle.new(root, {
                    radius: 5,
                    fill: "#00C853"
                })
            })
        })
        // BMI
        let lineSeriesBmi = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
                name: "BMI",
                xAxis: xAxis,
                yAxis: yAxisBmi,
                valueYField: "bmi",
                sequencedInterpolation: true,
                stroke: '#880E4F',
                fill: '#EC407A',
                categoryXField: "category",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "BMI {valueY}"
                })
            })
        );
        lineSeriesBmi.strokes.template.set("strokeWidth", 1);
        lineSeriesBmi.bullets.push(function () {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    stroke: lineSeriesBmi.get("fill"),
                    strokeWidth: 2,
                    fill: "#880E4F",
                    radius: 5
                })
            });
        });
        // when data validated, adjust location of data item based on count
        lineSeriesBmi.events.on("datavalidated", function () {
            am5.array.each(lineSeriesBmi.dataItems, function (dataItem) {
                // if count divides by two, location is 0 (on the grid)
                if (
                    dataItem.dataContext.count / 2 ===
                    Math.round(dataItem.dataContext.count / 2)
                ) {
                    dataItem.set("locationX", 0);
                }
                // otherwise location is 0.5 (middle)
                else {
                    dataItem.set("locationX", 0.5);
                }
            });
        });
        // Body Temp
        let lineSeriesbodyTemp = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
                name: "Temperature",
                xAxis: xAxis,
                yAxis: yAxisBodyTemp,
                valueYField: "bodyTemp",
                sequencedInterpolation: true,
                stroke: '#64B5F6',
                fill: '#2962FF',
                categoryXField: "category",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "อุณภูมิ {valueY} °C"
                })
            })
        );
        lineSeriesbodyTemp.strokes.template.set("strokeWidth", 1);
        lineSeriesbodyTemp.bullets.push(function () {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    stroke: lineSeriesbodyTemp.get("fill"),
                    strokeWidth: 2,
                    fill: "#BBDEFB",
                    radius: 5
                })
            });
        });
        // when data validated, adjust location of data item based on count
        lineSeriesbodyTemp.events.on("datavalidated", function () {
            am5.array.each(lineSeriesbodyTemp.dataItems, function (dataItem) {
                // if count divides by two, location is 0 (on the grid)
                if (
                    dataItem.dataContext.count / 2 ===
                    Math.round(dataItem.dataContext.count / 2)
                ) {
                    dataItem.set("locationX", 0);
                }
                // otherwise location is 0.5 (middle)
                else {
                    dataItem.set("locationX", 0.5);
                }
            });
        });
        // Pulse
        let lineSeriesPulse = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
                name: "Pulse",
                xAxis: xAxis,
                yAxis: yAxisPulse,
                valueYField: "pulse",
                sequencedInterpolation: true,
                stroke: '#E53935',
                fill: '#D50000',
                categoryXField: "category",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "Pulse {valueY}"
                })
            })
        );
        lineSeriesPulse.strokes.template.set("strokeWidth", 1);
        lineSeriesPulse.bullets.push(function () {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    stroke: lineSeriesPulse.get("fill"),
                    strokeWidth: 2,
                    fill: "#FFCDD2",
                    radius: 5
                })
            });
        });
        // when data validated, adjust location of data item based on count
        lineSeriesPulse.events.on("datavalidated", function () {
            am5.array.each(lineSeriesPulse.dataItems, function (dataItem) {
                // if count divides by two, location is 0 (on the grid)
                if (
                    dataItem.dataContext.count / 2 ===
                    Math.round(dataItem.dataContext.count / 2)
                ) {
                    dataItem.set("locationX", 0);
                }
                // otherwise location is 0.5 (middle)
                else {
                    dataItem.set("locationX", 0.5);
                }
            });
        });
        // Res Rate
        let lineSeriesResRate = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
                name: "Res Rate",
                xAxis: xAxis,
                yAxis: yAxisResRate,
                valueYField: "resRate",
                sequencedInterpolation: true,
                stroke: '#4A148C',
                fill: '#AB47BC',
                categoryXField: "category",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "Res Rate {valueY}"
                })
            })
        );
        lineSeriesResRate.strokes.template.set("strokeWidth", 1);
        lineSeriesResRate.bullets.push(function () {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    stroke: lineSeriesResRate.get("fill"),
                    strokeWidth: 2,
                    fill: "#FAFAFA",
                    radius: 5
                })
            });
        });
        // when data validated, adjust location of data item based on count
        lineSeriesResRate.events.on("datavalidated", function () {
            am5.array.each(lineSeriesResRate.dataItems, function (dataItem) {
                // if count divides by two, location is 0 (on the grid)
                if (
                    dataItem.dataContext.count / 2 ===
                    Math.round(dataItem.dataContext.count / 2)
                ) {
                    dataItem.set("locationX", 0);
                }
                // otherwise location is 0.5 (middle)
                else {
                    dataItem.set("locationX", 0.5);
                }
            });
        });
        // O2Sat
        let lineSeriesO2Sat = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
                name: "O2Sat",
                xAxis: xAxis,
                yAxis: yAxisO2Sat,
                valueYField: "o2Sat",
                sequencedInterpolation: true,
                stroke: '#009688',
                fill: '#4DB6AC',
                categoryXField: "category",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "o2Sat {valueY}"
                })
            })
        );
        lineSeriesO2Sat.strokes.template.set("strokeWidth", 1);
        lineSeriesO2Sat.bullets.push(function () {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    stroke: lineSeriesO2Sat.get("fill"),
                    strokeWidth: 2,
                    fill: "#FAFAFA",
                    radius: 5
                })
            });
        });
        // when data validated, adjust location of data item based on count
        lineSeriesO2Sat.events.on("datavalidated", function () {
            am5.array.each(lineSeriesO2Sat.dataItems, function (dataItem) {
                // if count divides by two, location is 0 (on the grid)
                if (
                    dataItem.dataContext.count / 2 ===
                    Math.round(dataItem.dataContext.count / 2)
                ) {
                    dataItem.set("locationX", 0);
                }
                // otherwise location is 0.5 (middle)
                else {
                    dataItem.set("locationX", 0.5);
                }
            });
        });
        // Weight
        let lineSeriesWeight = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
                name: "Weight",
                xAxis: xAxis,
                yAxis: yAxisWeight,
                valueYField: "weight",
                sequencedInterpolation: true,
                stroke: '#FFD700',
                fill: '#FFD700',
                categoryXField: "category",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "น้ำหนัก {valueY}"
                })
            })
        );
        lineSeriesWeight.strokes.template.set("strokeWidth", 1);
        lineSeriesWeight.bullets.push(function () {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    stroke: lineSeriesWeight.get("fill"),
                    strokeWidth: 2,
                    fill: "#FAFAFA",
                    radius: 5
                })
            });
        });
        // when data validated, adjust location of data item based on count
        lineSeriesWeight.events.on("datavalidated", function () {
            am5.array.each(lineSeriesWeight.dataItems, function (dataItem) {
                // if count divides by two, location is 0 (on the grid)
                if (
                    dataItem.dataContext.count / 2 ===
                    Math.round(dataItem.dataContext.count / 2)
                ) {
                    dataItem.set("locationX", 0);
                }
                // otherwise location is 0.5 (middle)
                else {
                    dataItem.set("locationX", 0.5);
                }
            });
        });
        // height
        let lineSeriesHeight = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
                name: "Height",
                xAxis: xAxis,
                yAxis: yAxisHeight,
                valueYField: "height",
                sequencedInterpolation: true,
                stroke: '#2E8B57',
                fill: '#228B22',
                categoryXField: "category",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "ส่วนสูง {valueY}"
                })
            })
        );
        lineSeriesHeight.strokes.template.set("strokeWidth", 1);
        lineSeriesHeight.bullets.push(function () {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    stroke: lineSeriesHeight.get("fill"),
                    strokeWidth: 2,
                    fill: "#9ACD32",
                    radius: 5
                })
            });
        });
        // when data validated, adjust location of data item based on count
        lineSeriesHeight.events.on("datavalidated", function () {
            am5.array.each(lineSeriesHeight.dataItems, function (dataItem) {
                // if count divides by two, location is 0 (on the grid)
                if (
                    dataItem.dataContext.count / 2 ===
                    Math.round(dataItem.dataContext.count / 2)
                ) {
                    dataItem.set("locationX", 0);
                }
                // otherwise location is 0.5 (middle)
                else {
                    dataItem.set("locationX", 0.5);
                }
            });
        });
        // HC
        let lineSeriesHC = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
                name: "รอบศีรษะ",
                xAxis: xAxis,
                yAxis: yAxisHC,
                valueYField: "hc",
                sequencedInterpolation: true,
                stroke: '#4682B4',
                fill: '#4682B4',
                categoryXField: "category",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "รอบศีรษะ {valueY}"
                })
            })
        );
        lineSeriesHC.strokes.template.set("strokeWidth", 1);
        lineSeriesHC.bullets.push(function () {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    stroke: lineSeriesHC.get("fill"),
                    strokeWidth: 2,
                    fill: "#B0C4DE",
                    radius: 5
                })
            });
        });
        // when data validated, adjust location of data item based on count
        lineSeriesHC.events.on("datavalidated", function () {
            am5.array.each(lineSeriesHC.dataItems, function (dataItem) {
                // if count divides by two, location is 0 (on the grid)
                if (
                    dataItem.dataContext.count / 2 ===
                    Math.round(dataItem.dataContext.count / 2)
                ) {
                    dataItem.set("locationX", 0);
                }
                // otherwise location is 0.5 (middle)
                else {
                    dataItem.set("locationX", 0.5);
                }
            });
        });
        // ChestlineIn
        let lineSeriesChestlineIn = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
                name: "รอบอก",
                xAxis: xAxis,
                yAxis: yAxisChestlineIn,
                valueYField: "chestlineIn",
                sequencedInterpolation: true,
                stroke: '#0000CD',
                fill: '#0000CD',
                categoryXField: "category",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "รอบอก {valueY}"
                })
            })
        );
        lineSeriesChestlineIn.strokes.template.set("strokeWidth", 1);
        lineSeriesChestlineIn.bullets.push(function () {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    stroke: lineSeriesChestlineIn.get("fill"),
                    strokeWidth: 2,
                    fill: "#0000FF",
                    radius: 5
                })
            });
        });
        // when data validated, adjust location of data item based on count
        lineSeriesChestlineIn.events.on("datavalidated", function () {
            am5.array.each(lineSeriesChestlineIn.dataItems, function (dataItem) {
                // if count divides by two, location is 0 (on the grid)
                if (
                    dataItem.dataContext.count / 2 ===
                    Math.round(dataItem.dataContext.count / 2)
                ) {
                    dataItem.set("locationX", 0);
                }
                // otherwise location is 0.5 (middle)
                else {
                    dataItem.set("locationX", 0.5);
                }
            });
        });

        let legend = chart.children.push(
            am5.Legend.new(root, {
                position: "",
                x: am5.p50,
                centerX: am5.p50,
            })
        );
        legend.data.setAll([
            // seriesBp, lineSeriesPulse, lineSeriesbodyTemp, lineSeriesBmi,
            // lineSeriesResRate, lineSeriesO2Sat, lineSeriesWeight, lineSeriesHeight,
            // lineSeriesHC, lineSeriesChestlineIn
        ]);

        chart.set(
            "scrollbarX",
            am5.Scrollbar.new(root, {
                orientation: "horizontal",
                // start: 0.1,
                // end: groupSize <= 3 ? 1 : groupSize > 3 && groupSize < 8 ? 0.45 : 0.2,
            })
        );

        let chartData = [];
        // process data ant prepare it for the chart
        for (var providerName in group) {
            let providerData = group[providerName];
            // add data of one provider to temp array
            // eslint-disable-next-line no-loop-func
            let filtered = filter(listData, o => o.provider === providerName)
            let tempArray = [];
            // add items
            for (var itemName in providerData) {
                // eslint-disable-next-line no-loop-func
                let findedData = find(filtered, o => o.realName === itemName)
                if (findedData) {
                    tempArray.push(findedData);
                } else {
                    tempArray.push({
                        category: nanoid(),
                        realName: itemName,
                        pulse: null,
                        bodyTemp: null,
                        bpOpen: null,
                        bpClose: null,
                        bmi: null,
                        resRate: null,
                        o2Sat: null,
                        weight: null,
                        height: null,
                        hc: null,
                        chestlineIn: null,
                        provider: providerName
                    });
                }
            }
            tempArray = sortBy(tempArray, "realName")
            am5.array.each(tempArray, function (item) {
                chartData.push(item);
            });
            // create range (the additional label at the bottom)
            let range = xAxis.makeDataItem({});
            xAxis.createAxisRange(range);

            range.set("category", tempArray[0].category);
            range.set("endCategory", tempArray[tempArray.length - 1].category);

            let label = range.get("label");

            label.setAll({
                text: tempArray[0].provider,
                dy: 30,
                fontWeight: "bold",
                tooltipText: tempArray[0].provider,
                rotation: groupSize <= 6 ? 0 : 25,
            });
            let tick = range.get("tick");
            tick.setAll({ visible: true, strokeOpacity: 1, length: 50, location: 0 });

            let grid = range.get("grid");
            grid.setAll({ strokeOpacity: 1 });
        }

        // console.log(chartData);

        // add range for the last grid
        let range = xAxis.makeDataItem({});
        xAxis.createAxisRange(range);
        range.set("category", chartData[chartData.length - 1].category);
        let tick = range.get("tick");
        tick.setAll({ visible: true, strokeOpacity: 1, length: 50, location: 1 });

        let grid = range.get("grid");
        grid.setAll({ strokeOpacity: 1, location: 1 });

        xAxis.data.setAll(chartData);

        // Make stuff animate on load
        // https://www.amcharts.com/docs/v5/concepts/animations/

        let mappingValue = map(chkValues, o => { return { value: o } })
        let finding = find(mappingValue, ['value', 'bp'])
        if (finding) {
            yRendererBp.grid.template.set("strokeOpacity", 0.05);
            yRendererBp.labels.template.set("fill", seriesBp.get("fill"));
            yRendererBp.setAll({
                stroke: seriesBp.get("fill"),
                strokeOpacity: 1,
                opacity: 1
            });
            seriesBp.data.setAll(chartData);
            seriesBp.appear(500);
        }
        finding = find(mappingValue, ['value', 'bmi'])
        if (finding) {
            yRendererBmi.grid.template.set("strokeOpacity", 0.05);
            yRendererBmi.labels.template.set("fill", lineSeriesBmi.get("fill"));
            yRendererBmi.setAll({
                stroke: lineSeriesBmi.get("fill"),
                strokeOpacity: 1,
                opacity: 1
            });
            lineSeriesBmi.data.setAll(chartData);
            lineSeriesBmi.appear(500);
        }
        finding = find(mappingValue, ['value', 'bodyTemp'])
        if (finding) {
            yRendererBodyTemp.grid.template.set("strokeOpacity", 0.05);
            yRendererBodyTemp.labels.template.set("fill", lineSeriesbodyTemp.get("fill"));
            yRendererBodyTemp.setAll({
                stroke: lineSeriesbodyTemp.get("fill"),
                strokeOpacity: 1,
                opacity: 1
            });
            lineSeriesbodyTemp.data.setAll(chartData);
            lineSeriesbodyTemp.appear(500);
        }
        finding = find(mappingValue, ['value', 'pulse'])
        if (finding) {
            yRendererPulse.grid.template.set("strokeOpacity", 0.05);
            yRendererPulse.labels.template.set("fill", lineSeriesPulse.get("fill"));
            yRendererPulse.setAll({
                stroke: lineSeriesPulse.get("fill"),
                strokeOpacity: 1,
                opacity: 1
            });
            lineSeriesPulse.data.setAll(chartData);
            lineSeriesPulse.appear(500);
        }
        finding = find(mappingValue, ['value', 'resRate'])
        if (finding) {
            yRendererResRate.grid.template.set("strokeOpacity", 0.05);
            yRendererResRate.labels.template.set("fill", lineSeriesResRate.get("fill"));
            yRendererResRate.setAll({
                stroke: lineSeriesResRate.get("fill"),
                strokeOpacity: 1,
                opacity: 1
            });
            lineSeriesResRate.data.setAll(chartData);
            lineSeriesResRate.appear(500);
        }
        finding = find(mappingValue, ['value', 'o2Sat'])
        if (finding) {
            yRendererO2Sat.grid.template.set("strokeOpacity", 0.05);
            yRendererO2Sat.labels.template.set("fill", lineSeriesO2Sat.get("fill"));
            yRendererO2Sat.setAll({
                stroke: lineSeriesO2Sat.get("fill"),
                strokeOpacity: 1,
                opacity: 1
            });
            lineSeriesO2Sat.data.setAll(chartData);
            lineSeriesO2Sat.appear(500);
        }
        finding = find(mappingValue, ['value', 'weight'])
        if (finding) {
            yRendererWeight.grid.template.set("strokeOpacity", 0.05);
            yRendererWeight.labels.template.set("fill", lineSeriesWeight.get("fill"));
            yRendererWeight.setAll({
                stroke: lineSeriesWeight.get("fill"),
                strokeOpacity: 1,
                opacity: 1
            });
            lineSeriesWeight.data.setAll(chartData);
            lineSeriesWeight.appear(500);
        }
        finding = find(mappingValue, ['value', 'height'])
        if (finding) {
            yRendererHeight.grid.template.set("strokeOpacity", 0.05);
            yRendererHeight.labels.template.set("fill", lineSeriesHeight.get("fill"));
            yRendererHeight.setAll({
                stroke: lineSeriesHeight.get("fill"),
                strokeOpacity: 1,
                opacity: 1
            });
            lineSeriesHeight.data.setAll(chartData);
            lineSeriesHeight.appear(500);
        }
        finding = find(mappingValue, ['value', 'hc'])
        if (finding) {
            yRendererHC.grid.template.set("strokeOpacity", 0.05);
            yRendererHC.labels.template.set("fill", lineSeriesHC.get("fill"));
            yRendererHC.setAll({
                stroke: lineSeriesHC.get("fill"),
                strokeOpacity: 1,
                opacity: 1
            });
            lineSeriesHC.data.setAll(chartData);
            lineSeriesHC.appear(500);
        }
        finding = find(mappingValue, ['value', 'chestlineIn'])
        if (finding) {
            yRendererChestlineIn.grid.template.set("strokeOpacity", 0.05);
            yRendererChestlineIn.labels.template.set("fill", lineSeriesChestlineIn.get("fill"));
            yRendererChestlineIn.setAll({
                stroke: lineSeriesChestlineIn.get("fill"),
                strokeOpacity: 1,
                opacity: 1
            });
            lineSeriesChestlineIn.data.setAll(chartData);
            lineSeriesChestlineIn.appear(500);
        }

        chart.appear(500, 100);
    }
    const ManageDataSource = () => {
        let tempDataSource = [...dataSource]
        let formValues = form.getFieldsValue()
        let startDate = formValues?.startDate || null
        let endDate = formValues?.endDate || null
        // console.log('startDate', startDate)
        // console.log('endDate :>> ', endDate);
        if (startDate) {
            let filterX = filter(tempDataSource, o => o.dateCreatedForSortStart >= startDate)
            tempDataSource = filterX
        }
        if (endDate) {
            let filterX = filter(tempDataSource, o => o.dateCreatedForSortEnd <= endDate)
            tempDataSource = filterX
        }
        // console.log('tempDataSource', tempDataSource)
        let group = groupBy(tempDataSource, "dateCreatedDate")
        let size = Object.keys(group).length
        for (let i = 0; i < size; i++) {
            group[Object.keys(group)[i]] = {
                "02": "02",
                "06": "06",
                "10": "10",
                "14": "14",
                "18": "18",
                "22": "22",
            }
        }
        const calcTime = (time) => {
            let HH = toNumber(time.slice(0, 2))
            let result = null
            if (HH >= 2 && HH < 6) {
                result = "02"
            }
            if (HH >= 6 && HH < 10) {
                result = "06"
            }
            if (HH >= 10 && HH < 14) {
                result = "10"
            }
            if (HH >= 14 && HH < 18) {
                result = "14"
            }
            if (HH >= 18 && HH < 22) {
                result = "18"
            }
            if ((HH > 22 && HH < 24) || (HH >= 0 && HH < 2)) {
                result = "22"
            }
            return result
        }

        let mappingA = tempDataSource.map(o => {
            if (o?.dateCreatedTime?.length > 2) {
                o.dateCreatedTime = calcTime(o.dateCreatedTime)
            }
            return o
        })
        let groupA = groupBy(mappingA, "dateCreatedDate")
        let listGroup = []
        for (let i = 0; i < size; i++) {
            listGroup = listGroup.concat([groupA[Object.keys(groupA)[i]]])
        }
        // eslint-disable-next-line array-callback-return
        let mappingListGroup = listGroup.map(o => {
            if (o.length === 1) {
                return o
            }
            if (o.length > 1) {
                let uniqData = uniqBy(o, "dateCreatedTime")
                return uniqData
            }
        })
        // setListForVistalSignTable(mappingListGroup)
        let reverse = []
        for (let i = 0; i < mappingListGroup.length; i++) {
            reverse = reverse.concat(mappingListGroup[i])
        }
        let mapping = reverse.map(o => {
            return {
                category: nanoid(),
                provider: o.dateCreatedDate,
                realName: o.dateCreatedTime,
                bodyTemp: o.bodyTemperature ? toNumber(o.bodyTemperature) : null,
                bpClose: o.bpSystolic ? toNumber(o.bpSystolic) : null,
                bpOpen: o.bpDiastolic ? toNumber(o.bpDiastolic) : null,
                pulse: o.pulse ? toNumber(o.pulse) : null,
                bmi: o.bmi ? toNumber(o.bmi) : null,
                resRate: o.respiratory ? toNumber(o.respiratory) : null,
                o2Sat: o.o2sat ? toNumber(o.o2sat) : null,
                weight: o.weight ? toNumber(o.weight) : null,
                height: o.height ? toNumber(o.height) : null,
                hc: o.headCircumference ? toNumber(o.headCircumference) : null,
                chestlineIn: o.chestlineIn ? toNumber(o.chestlineIn) : null,
            }
        })

        let mappingValue = map(options, 'value')
        let differenceChk = differenceBy(mappingValue, chkValues)
        if (differenceChk.length > 0) {
            let array = mapping;
            array.map(function (item) {
                for (let val of differenceChk) {
                    delete item[val];
                }
                return item;
            });
            // console.log('deleteFields', deleteFields)
        }
        setDataForChart({
            group: group, mapping: mapping, size: size
        })

        let newId = nanoid()
        setChartName(newId)
    }

    useEffect(() => {
        ManageDataSource()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chkValues, dataSource])
    useEffect(() => {
        if (chartName) {
            dataForChart.mapping.length > 0 && chart(dataForChart.group, dataForChart.mapping, dataForChart.size)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartName])

    const notificationX = (type, title, extra = null) => {
        notification[type ? "success" : "warning"]({
            message: (
                <label className={type ? "gx-text-primary-bold" : "topic-danger-bold"}>
                    {title}
                </label>
            ),
            description: (
                <>
                    {extra ? (
                        <label style={{ color: "orange" }}>{extra}</label>
                    ) : (
                        <label className={type ? "gx-text-primary me-1" : "topic-danger me-1"}>
                            {type ? "สำเร็จ" : "ไม่สำเร็จ"}
                        </label>
                    )}
                </>
            ),
            duration: 5,
        });
    };

    return (
        <Modal
            title={
                <ConfigProvider locale={thTH}>
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={onFinish}
                    >
                        <Row gutter={[8, 8]} align="middle" style={{ flexDirection: "row" }}>
                            <Col>
                                <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>7.5.3 Vital Signs</label>
                            </Col>
                            <Col>
                                <label className="gx-text-primary fw-bold ms-4 me-3" style={{ fontSize: 18 }}>
                                    เลือกวันที่แสดง
                                </label>
                                {/* <DatePicker
                            format="DD/MM/YYYY"
                        /> */}
                            </Col>
                            <Col>
                                <Form.Item name="startDate" noStyle>
                                    <DayjsDatePicker
                                        placeholder="วันเริ่ม"
                                        format={"DD/MM/YYYY"}
                                        form={form}
                                        name="startDate"
                                        style={{ width: 140 }}
                                        // disabled={disabledDate}
                                        onChange={(v) => {
                                            let startDate = null
                                            if (v) {
                                                startDate = dayjs(v).format("YYYY-MM-DD 00:00:00")
                                                startDate = dayjs(startDate)
                                                let endDate = form.getFieldValue("endDate")
                                                if (endDate && startDate > endDate) {
                                                    // console.log('มากกว่า :>> ');
                                                    notificationX(false, "วันที่เริ่มเกินวันสิ้นสุด", "กรุณาเลือกใหม่")
                                                    form.setFieldsValue({ startDate: null })
                                                } else {
                                                    form.setFieldsValue({ startDate: startDate })
                                                    form.submit()
                                                }
                                            } else {
                                                form.submit()
                                            }
                                        }}
                                    />
                                    {/* <DatePicker
                                        placeholder="เริ่มวันที่"
                                        format={"DD/MM/YYYY"}
                                        style={{ width: 140 }}
                                        onChange={(v) => {
                                            let startDate = null
                                            if (v) {
                                                startDate = moment(v).format("YYYY-MM-DD 00:00:00")
                                                startDate = moment(startDate)
                                                let endDate = form.getFieldValue("endDate")
                                                if (endDate && startDate > endDate) {
                                                    // console.log('มากกว่า :>> ');
                                                    notificationX(false, "วันที่เริ่มเกินวันสิ้นสุด", "กรุณาเลือกใหม่")
                                                    form.setFieldsValue({ startDate: null })
                                                } else {
                                                    form.setFieldsValue({ startDate: startDate })
                                                    form.submit()
                                                }
                                            } else {
                                                form.submit()
                                            }
                                        }}
                                    /> */}
                                </Form.Item>
                            </Col>
                            <Col>
                                <Form.Item name="endDate" noStyle>
                                    <DayjsDatePicker
                                        placeholder="ถึงวันที่"
                                        format={"DD/MM/YYYY"}
                                        form={form}
                                        name="endDate"
                                        style={{ width: 140 }}
                                        // disabled={disabledDate}
                                        onChange={(v) => {
                                            let endDate = null
                                            if (v) {
                                                endDate = dayjs(v).format("YYYY-MM-DD 23:59:59")
                                                endDate = dayjs(endDate)
                                                let startDate = form.getFieldValue("startDate")
                                                if (startDate && endDate < startDate) {
                                                    notificationX(false, "วันที่สิ้นสุดน้อยกว่าวันที่เริ่ม", "กรุณาเลือกใหม่")
                                                    form.setFieldsValue({ endDate: null })
                                                } else {
                                                    form.setFieldsValue({ endDate: endDate })
                                                    form.submit()
                                                }
                                            } else {
                                                form.submit()
                                            }
                                        }}
                                    />
                                    {/* <DatePicker
                                        placeholder="ถึงวันที่"
                                        format={"DD/MM/YYYY"}
                                        style={{ width: 140 }}
                                        onChange={(v) => {
                                            let endDate = null
                                            if (v) {
                                                endDate = moment(v).format("YYYY-MM-DD 23:59:59")
                                                endDate = moment(endDate)
                                                let startDate = form.getFieldValue("startDate")
                                                if (startDate && endDate < startDate) {
                                                    notificationX(false, "วันที่สิ้นสุดน้อยกว่าวันที่เริ่ม", "กรุณาเลือกใหม่")
                                                    form.setFieldsValue({ endDate: null })
                                                } else {
                                                    form.setFieldsValue({ endDate: endDate })
                                                    form.submit()
                                                }
                                            } else {
                                                form.submit()
                                            }
                                        }}
                                    /> */}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </ConfigProvider>
            }
            centered
            visible={isVisible}
            onCancel={() => setIsVisible(false)}
            width={1100}
            footer={
                <div className="text-center">
                    <Button onClick={() => setIsVisible(false)}>
                        ปิด
                    </Button>
                </div>
            }
        >
            <Row gutter={[8, 8]}>
                <Col span={3}>
                    <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                        ทั้งหมด
                    </Checkbox>
                </Col>
                <Col span={21} className="text-center">
                    <Checkbox.Group options={options} value={chkValues} onChange={onChangeChk} />
                </Col>
                <Col span={24}>
                    <div
                        id={chartName}
                        key={chartName}
                        style={{ width: "100%", height: "480px", overflow: "hidden" }}
                    />
                </Col>
            </Row>
        </Modal>
    )
}
const options = [
    {
        label: <label style={{ color: "#00C853" }}>Blood Pressure</label>,
        value: 'bp',
    },
    {
        label: <label style={{ color: "#880E4F" }}>BMI</label>,
        value: 'bmi',
    },
    {
        label: <label style={{ color: "#64B5F6" }}>Temperature</label>,
        value: 'bodyTemp',
    },
    {
        label: <label style={{ color: "#E53935" }}>Pulse Rate</label>,
        value: 'pulse',
    },
    {
        label: <label style={{ color: "#4A148C" }}>Res Rate</label>,
        value: 'resRate',
    },
    {
        label: <label style={{ color: "#009688" }}>O2Sat</label>,
        value: 'o2Sat',
    },
    {
        label: <label style={{ color: "#FFD700" }}>น้ำหนัก</label>,
        value: 'weight',
    },
    {
        label: <label style={{ color: "#2E8B57" }}>ส่วนสูง</label>,
        value: 'height',
    },
    {
        label: <label style={{ color: "#4682B4" }}>รอบศีรษะ</label>,
        value: 'hc',
    },
    {
        label: <label style={{ color: "#0000CD" }}>รอบอก</label>,
        value: 'chestlineIn',
    },
];
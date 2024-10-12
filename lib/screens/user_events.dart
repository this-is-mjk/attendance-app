// ignore_for_file: library_private_types_in_public_api, camel_case_types

import 'dart:convert';

import 'package:attendance_app/services/store.dart';
import 'package:flutter/material.dart';
import 'package:attendance_app/table_calendar.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

class userEvents extends StatefulWidget {
  const userEvents({super.key});
  @override
  _userEventsState createState() => _userEventsState();
}

const Key calendarKey = Key('Calendar');
const Key eventKey = Key(
    'Events'); //key in internal code of Calendar just before event card generation

class _userEventsState extends State<userEvents> {
  late final ValueNotifier<List<Event>> _selectedEvents;
  CalendarFormat _calendarFormat = CalendarFormat.month;
  RangeSelectionMode _rangeSelectionMode = RangeSelectionMode
      .toggledOff; // Can be toggled on/off by longpressing a date
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  DateTime? _rangeStart;
  DateTime? _rangeEnd;
  bool _isLoading = false;
  Map kEvents = {};

  @override
  void initState() {
    super.initState();

    _selectedDay = _focusedDay;
    _selectedEvents = ValueNotifier(_getEventsForDay(_selectedDay!));
    _fetchEvents();
  }

  @override
  void dispose() {
    _selectedEvents.dispose();
    super.dispose();
  }

  List<Event> _getEventsForDay(DateTime day) {
    // Implementation example
    return kEvents[day] ?? [];
  }

  List<Event> _getEventsForRange(DateTime start, DateTime end) {
    // Implementation example
    final days = daysInRange(start, end);

    return [
      for (final d in days) ..._getEventsForDay(d),
    ];
  }

  void _onDaySelected(DateTime selectedDay, DateTime focusedDay) {
    if (!isSameDay(_selectedDay, selectedDay)) {
      setState(() {
        _selectedDay = selectedDay;
        _focusedDay = focusedDay;
        _rangeStart = null; // Important to clean those
        _rangeEnd = null;
        _rangeSelectionMode = RangeSelectionMode.toggledOff;
      });

      _selectedEvents.value = _getEventsForDay(selectedDay);
    }
  }

  void _onRangeSelected(DateTime? start, DateTime? end, DateTime focusedDay) {
    setState(() {
      _selectedDay = null;
      _focusedDay = focusedDay;
      _rangeStart = start;
      _rangeEnd = end;
      _rangeSelectionMode = RangeSelectionMode.toggledOn;
    });

    // `start` or `end` could be null
    if (start != null && end != null) {
      _selectedEvents.value = _getEventsForRange(start, end);
    } else if (start != null) {
      _selectedEvents.value = _getEventsForDay(start);
    } else if (end != null) {
      _selectedEvents.value = _getEventsForDay(end);
    }
  }

// Function to group events by date
  Map<String, List<Event>> groupEventsByDate(List events) {
    Map<String, List<Event>> eventsByDate = {};

    for (var event in events) {
      Event convertedEvent = Event(
        event['title'],
        event['location']['locationName'],
        event['description'],
        DateTime.parse(event['date']),
        List<int>.from(event['assignedOfficers']
            .map((officer) => officer['employeeId'])), // Ensure type List<int>
        List<int>.from(event['subEvents']
            .map((subEvent) => subEvent['id'])), // Ensure type List<int>
        event['id'],
      );
      DateTime eventDate =
          DateTime.parse(event['date']); // Convert string to DateTime
      String dateKey =
          eventDate.toIso8601String().split('T')[0]; // Format as YYYY-MM-DD
      // If the date already exists in the map, add to the list, otherwise create a new list
      if (eventsByDate.containsKey(dateKey)) {
        eventsByDate[dateKey]!.add(convertedEvent);
      } else {
        eventsByDate[dateKey] = [convertedEvent];
      }
    }
    return eventsByDate;
  }

  Future<void> _fetchEvents() async {
    setState(() {
      _isLoading = true;
    });
    String? token = await TokenService().getToken();
    Map<String, dynamic>? decodedToken = await TokenService().getDecodedToken();
    int userId = decodedToken!['user']['userId'];
    // Make API call to fetch events
    try {
      final response = await http.get(
        Uri.parse('http://localhost:3000/user/events'),
        headers: {
          'Authorization':
              'Bearer $token', // Set the Bearer token in the header
        },
      );
      if (response.statusCode == 200) {
        // print(response.body);
        setState(() {
          kEvents = groupEventsByDate(jsonDecode(response.body)['events']);
        });
        print(kEvents);
      } else {
        kEvents = {};
      }
    } catch (err) {
      print(err);
      Get.snackbar("Something went wrong", "Please Try Again Later",
          colorText: Colors.white, backgroundColor: Colors.red);
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Event History"),
        backgroundColor: Colors.blue,
      ),
      body: Stack(
        children: [
          Column(
            children: [
              TableCalendar<Event>(
                key: calendarKey,
                firstDay: kFirstDay,
                lastDay: kLastDay,
                focusedDay: _focusedDay,
                selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                rangeStartDay: _rangeStart,
                rangeEndDay: _rangeEnd,
                calendarFormat: _calendarFormat,
                rangeSelectionMode: _rangeSelectionMode,
                eventLoader: _getEventsForDay,
                startingDayOfWeek: StartingDayOfWeek.monday,
                calendarStyle: const CalendarStyle(
                  // Use `CalendarStyle` to customize the UI
                  outsideDaysVisible: false,
                ),
                onDaySelected: _onDaySelected,
                onRangeSelected: _onRangeSelected,
                onFormatChanged: (format) {
                  if (_calendarFormat != format) {
                    setState(() {
                      _calendarFormat = format;
                    });
                  }
                },
                onPageChanged: (focusedDay) {
                  _focusedDay = focusedDay;
                },
              ),
              const SizedBox(height: 8.0),
              Expanded(
                key: eventKey,
                child: ValueListenableBuilder<List<Event>>(
                  valueListenable: _selectedEvents,
                  builder: (context, value, _) {
                    return ListView.builder(
                      itemCount: value.length,
                      itemBuilder: (context, index) {
                        return Container(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 60.0,
                            vertical: 4.0,
                          ),
                          decoration: BoxDecoration(
                              border: Border.all(),
                              borderRadius: BorderRadius.circular(20.0),
                              color: Colors.amber[100]),
                          child: ListTile(
                            // onTap: () => print('${value[index]}'),
                            title: Text(
                                'Event : ${value[index].title} , At : ${value[index].location}'),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
          if (_isLoading)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            )
        ],
      ),
    );
  }
}

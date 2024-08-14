import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_map_location_marker/flutter_map_location_marker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:io' show Platform;

class LocationMap extends StatelessWidget {
  // final List<LatLng> locations;
  final List<LocationMarkerPosition> locations;

  LocationMap({Key? key, required this.locations}) : super(key: key);

  static Future<void> openMap(double lat, double lng) async {
    String url = '';
    String urlAppleMaps = '';
    if (Platform.isIOS || Platform.isMacOS) {
      urlAppleMaps = 'https://maps.apple.com/?q=$lat,$lng';
      url = 'comgooglemaps://?saddr=&daddr=$lat,$lng&directionsmode=driving';
      if (await canLaunchUrl(Uri.parse(url))) {
        await launchUrl(Uri.parse(url));
      } else if (await canLaunchUrl(Uri.parse(urlAppleMaps))) {
        await launchUrl(Uri.parse(urlAppleMaps)); // Exception has occurred. PlatformException (PlatformException(Error, Error while launching https://maps.apple.com/?q=37.7657814,-122.4075538, null, null))
      } else {
        throw 'Could not launch $url';
      }
    } else {
      url = 'https://www.google.com/maps/search/?api=1&query=$lat,$lng';
      if (await canLaunchUrl(Uri.parse(url))) {
        await launchUrl(Uri.parse(url));
      } else {
        throw 'Could not launch $url';
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Determine the initial center based on the first location in the list,
    // or a default location if `_locations` is empty.
    LocationMarkerPosition initialCenter = locations.isNotEmpty
        ? locations.first
        // : LatLng(28.6139, 77.2090); // Default center (Delhi, India)
        : LocationMarkerPosition(
            latitude: 28.6139, longitude: 77.2090, accuracy: 100.00);

    return FlutterMap(
      options: MapOptions(
        initialCenter: LatLng(initialCenter.latitude, initialCenter.longitude),
        initialZoom: 17,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.example.app',
        ),
        ...locations.map((loacation) {
          return LocationMarkerLayer(
            position: loacation,
            style: LocationMarkerStyle(
              marker: InkWell(
                onTap: () {
                  openMap(loacation.latitude, loacation.longitude);
                },
                child: CircleAvatar(
                  backgroundImage: AssetImage('assets/profileimg.png'),
                ),
              ),
              markerSize: Size(50, 50),
            ),
          );
        }).toList()
      ],
    );
  }
}

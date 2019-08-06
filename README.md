PAC
===

Utility command for

- Creating PAC(Proxy Auto-Config) file
- Uploading created PAC file

# For What?

It's too much bother to configure for proxy tools ([Charles Web Debugging Proxy](https://www.charlesproxy.com/), [mitmproxy](https://mitmproxy.org/) and more) on mobile(Android, iPhone). Because you have to set the proxy destination when the proxy server's IP address changes.

This tool is to help you to create [PAC](https://en.wikipedia.org/wiki/Proxy_auto-config) file and upload it to Amazon S3.
You just have to do is configure proxy for PAC. That's it.

# Usage

## 1. Configure

Config file locate at `~/.pac/config.yml`. You have to config for PAC file location.

```yaml
---
s3:
  bucket: your-s3-bucket-name
  path: /
```

## 2. Make proxy enable

```sh
$ pac enable
```

It is using [`aws` command. ](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html). You have to setup authorization before use this.

## 3. Configure for mobile

Set PAC URL to Proxy configuration on mobile

```
https://your-s3-bucket-name.s3.amazonaws.com/your-name.pac
```

## 4. Make proxy disable

```sh
$ pac disable
```

# License

```
Copyright 2019 tomorrowkey

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

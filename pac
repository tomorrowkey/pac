#!/usr/bin/env ruby

require 'tempfile'
require 'erb'
require 'yaml'

VERSION = '1.0.0'

class Pac
  TEMPLATE_ENABLE = <<~EOS
  function FindProxyForURL(url, host) {
    if (isPlainHostName(host) || isInNet(host,"127.0.0.1", "255.255.255.255")) {
      return "DIRECT";
    } else {
      return "PROXY <%= local_ip %>:8888; DIRECT";
    }
  }
  EOS

  TEMPLATE_DISABLE = <<~EOS
  function FindProxyForURL(url, host) {
    return "DIRECT";
  }
  EOS
  CONFIG_PATH = "#{ENV['HOME']}/.pac/config.yml"

  def enable
    update_pac(enabled_pac)
  end

  def disable
    update_pac(disabled_pac)
  end

  def help
    puts <<~EOS
    Usage: pac {enable|disable} --dry-run
    EOS
  end

  def version
    puts VERSION
  end

  private

  def dry_run?
    ARGV.include? '--dry-run'
  end

  def ensure_cli_available!(command)
    if `which #{command}`.chomp.empty?
      STDERR.puts "#{command} is not installed"
      exit 1
    end
  end

  def local_ip
    `ipconfig getifaddr $(route get default|grep 'interface:'|awk '{print $2}')`.chomp
  end

  def config
    @config ||= YAML.load(File.read(CONFIG_PATH)) || {} rescue {}
  end

  def update_pac(pac)
    puts pac
    return if dry_run?

    Tempfile.create(["#{username}_", '.pac']) do |file|
      file.write(pac)
      file.flush

      dispatch(file, config)
    end
  end

  def dispatch(file, config)
    if disaptch_config = config['s3']
      ensure_cli_available!('aws')

      `aws s3 cp #{file.path} s3://#{disaptch_config['bucket']}#{disaptch_config['path']}#{pac_filename}`
    elsif disaptch_config = config['gcs']
      ensure_cli_available!('gsutil')

      `gsutil cp #{file.path} gs://#{disaptch_config['bucket']}#{disaptch_config['path']}#{pac_filename}`
    else
      STDERR.puts <<~EOS
      No upload configurations in #{CONFIG_PATH}
      EOS

      exit 1
    end
  end

  def enable_pac_template
    File.read("#{ENV['HOME']}/.pac/enable") rescue TEMPLATE_ENABLE
  end

  def disable_pac_template
    File.read("#{ENV['HOME']}/.pac/disable") rescue TEMPLATE_DISABLE
  end

  def enabled_pac
    ERB.new(enable_pac_template).result(binding)
  end

  def disabled_pac
    ERB.new(disable_pac_template).result(binding)
  end

  def pac_filename
    "#{username}.pac"
  end

  def username
    ENV['USER']
  end
end

pac = Pac.new

option = :"#{ARGV.first}"
if pac.respond_to? option
  pac.send(option)
else
  pac.help
  exit 1
end

'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const Lucid = use('Lucid');

class IpInformation extends Lucid {
  static get table () {
    return 'ip_information'
  }
}

module.exports = IpInformation

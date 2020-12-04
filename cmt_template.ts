export default (fields) => 
`<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>Afar</label>
    <protected>true</protected>
${fields.map(_ => 
`    <values>
        <field>${_.name}</field>
        <value xsi:type="xsd:${_.type ? _.type : 'string'}">${_.value}</value>
    </values>`).join('\n')}
</CustomMetadata>`;